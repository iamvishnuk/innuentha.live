import { and, eq, gte, lte, ne, or, sql } from 'drizzle-orm';
import { db } from '@innuentha/supabase/db';
import { events } from '@innuentha/supabase/schema';
import type { TEvent } from '@innuentha/supabase/schema';

export type DuplicateResult =
  | { isDuplicate: false }
  | { isDuplicate: true; reason: string; matchedEventId: string };

// ---------------------------------------------------------------------------
// Dice coefficient — bigram-based string similarity (0 = no match, 1 = exact)
// Handles word reordering better than Levenshtein:
//   "Thrissur Pooram 2025" vs "Pooram 2025 Thrissur" → ~0.90
// Exported for unit testing.
// ---------------------------------------------------------------------------
export function bigrams(str: string): Set<string> {
  const normalized = str.toLowerCase().replace(/\s+/g, ' ').trim();
  const pairs = new Set<string>();
  for (let i = 0; i < normalized.length - 1; i++) {
    pairs.add(normalized.slice(i, i + 2));
  }
  return pairs;
}

export function diceCoefficient(a: string, b: string): number {
  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);
  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const bigram of bigramsA) {
    if (bigramsB.has(bigram)) intersection++;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]!;
}

// ---------------------------------------------------------------------------
// Main detector
// ---------------------------------------------------------------------------
export class DuplicateDetector {
  /** Similarity threshold for fuzzy name matching (0–1). */
  private static readonly FUZZY_THRESHOLD = 0.85;

  /** Days window around startDate for fuzzy candidate query. */
  private static readonly DATE_WINDOW_DAYS = 7;

  async check(event: TEvent): Promise<DuplicateResult> {
    // ── Stage 1: Exact match ────────────────────────────────────────────────
    // Same name (case-insensitive) + same startDate + same district,
    // excluding the event itself and already-rejected events.
    const exactMatches = await db
      .select({ id: events.id, eventName: events.eventName })
      .from(events)
      .where(
        and(
          ne(events.id, event.id),
          sql`LOWER(${events.eventName}) = LOWER(${event.eventName})`,
          eq(events.startDate, event.startDate),
          eq(events.district, event.district),
          or(eq(events.status, 'approved'), eq(events.status, 'pending'))
        )
      )
      .limit(1);

    if (exactMatches.length > 0) {
      return {
        isDuplicate: true,
        reason: `Exact duplicate of existing event "${exactMatches[0]!.eventName}" (id: ${exactMatches[0]!.id})`,
        matchedEventId: exactMatches[0]!.id,
      };
    }

    // ── Stage 2: Fuzzy match ────────────────────────────────────────────────
    // Fetch candidates in same district with overlapping date window,
    // then score with Dice coefficient in JavaScript.
    const windowStart = addDays(event.startDate, -DuplicateDetector.DATE_WINDOW_DAYS);
    const windowEnd = addDays(event.startDate, DuplicateDetector.DATE_WINDOW_DAYS);

    const candidates = await db
      .select({ id: events.id, eventName: events.eventName, startDate: events.startDate })
      .from(events)
      .where(
        and(
          ne(events.id, event.id),
          eq(events.district, event.district),
          gte(events.startDate, windowStart),
          lte(events.startDate, windowEnd),
          or(eq(events.status, 'approved'), eq(events.status, 'pending'))
        )
      );

    for (const candidate of candidates) {
      const score = diceCoefficient(event.eventName, candidate.eventName);
      if (score >= DuplicateDetector.FUZZY_THRESHOLD) {
        return {
          isDuplicate: true,
          reason: `Similar to existing event "${candidate.eventName}" (${Math.round(score * 100)}% name similarity, id: ${candidate.id})`,
          matchedEventId: candidate.id,
        };
      }
    }

    return { isDuplicate: false };
  }
}
