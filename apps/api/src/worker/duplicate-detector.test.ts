import { describe, it, expect } from 'vitest';

// ── Pure utility exports from duplicate-detector ────────────────────────────
// We expose these for testability; they live alongside the DuplicateDetector class.
import { bigrams, diceCoefficient } from './duplicate-detector';

// ---------------------------------------------------------------------------
// bigrams()
// ---------------------------------------------------------------------------
describe('bigrams()', () => {
  it('returns bigrams for a normal string', () => {
    const result = bigrams('hello');
    // "he", "el", "ll", "lo"
    expect(result.size).toBe(4);
    expect(result.has('he')).toBe(true);
    expect(result.has('lo')).toBe(true);
  });

  it('normalises whitespace and case', () => {
    const a = bigrams('Thrissur  Pooram');
    const b = bigrams('thrissur pooram');
    expect(a).toEqual(b);
  });

  it('returns empty set for strings shorter than 2 chars', () => {
    expect(bigrams('').size).toBe(0);
    expect(bigrams('a').size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// diceCoefficient()
// ---------------------------------------------------------------------------
describe('diceCoefficient()', () => {
  it('returns 1 for identical strings', () => {
    expect(diceCoefficient('Thrissur Pooram 2025', 'Thrissur Pooram 2025')).toBe(1);
  });

  it('returns 0 for completely different strings', () => {
    expect(diceCoefficient('aaa', 'zzz')).toBe(0);
  });

  it('returns high score for word-reordered duplicates', () => {
    // "Thrissur Pooram 2025" vs "Pooram 2025 Thrissur"
    const score = diceCoefficient('Thrissur Pooram 2025', 'Pooram 2025 Thrissur');
    expect(score).toBeGreaterThan(0.85);
  });

  it('returns score above threshold for near-identical names', () => {
    const score = diceCoefficient('Onam Festival Kochi', 'Onam Festival Kochi 2025');
    expect(score).toBeGreaterThan(0.7);
  });

  it('returns low score for genuinely different events', () => {
    const score = diceCoefficient('Thrissur Pooram', 'Cochin Carnival');
    expect(score).toBeLessThan(0.4);
  });

  it('handles empty strings without throwing', () => {
    expect(diceCoefficient('', 'test')).toBe(0);
    expect(diceCoefficient('test', '')).toBe(0);
  });
});
