// Visual style for each event category, shared across web and map packages
export type CategoryStyle = {
  emoji: string;
  label: string;
  color: string;
  /** Semi-transparent variant of `color` used for map marker pulse rings */
  ringColor: string;
  /** Tailwind bg utility (web sidebar / detail dialog) */
  bg: string;
  /** Tailwind text utility (web sidebar / detail dialog) */
  text: string;
};

export const EVENT_CATEGORIES = [
  {
    value: 'POORAM',
    label: 'Pooram',
    emoji: '🐘',
    color: '#D97706',
    ringColor: 'rgba(217, 119, 6, 0.4)',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400'
  },
  {
    value: 'PERUNNAL',
    label: 'Perunnal',
    emoji: '⛪',
    color: '#E63946',
    ringColor: 'rgba(230, 57, 70, 0.4)',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400'
  },
  {
    value: 'NERCHA',
    label: 'Nercha',
    emoji: '🕌',
    color: '#2A9D8F',
    ringColor: 'rgba(42, 157, 143, 0.4)',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-700 dark:text-teal-400'
  },
  {
    value: 'TEMPLE_FESTIVAL',
    label: 'Temple Festival',
    emoji: '🪔',
    color: '#F4A261',
    ringColor: 'rgba(244, 162, 97, 0.4)',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-400'
  },
  {
    value: 'COLLEGE_FEST',
    label: 'College Fest',
    emoji: '🎓',
    color: '#9B5DE5',
    ringColor: 'rgba(155, 93, 229, 0.4)',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-400'
  },
  {
    value: 'FOOD_FESTIVAL',
    label: 'Food Festival',
    emoji: '🍔',
    color: '#10B981',
    ringColor: 'rgba(16, 185, 129, 0.4)',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400'
  },
  {
    value: 'MUSIC_CONCERT',
    label: 'Music Concert',
    emoji: '🎸',
    color: '#7209B7',
    ringColor: 'rgba(114, 9, 183, 0.4)',
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-700 dark:text-violet-400'
  },
  {
    value: 'DJ_EVENT',
    label: 'DJ Event',
    emoji: '🎧',
    color: '#F72585',
    ringColor: 'rgba(247, 37, 133, 0.4)',
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-700 dark:text-pink-400'
  },
  {
    value: 'EXHIBITION',
    label: 'Exhibition',
    emoji: '🖼️',
    color: '#3A86C8',
    ringColor: 'rgba(58, 134, 200, 0.4)',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-700 dark:text-sky-400'
  },
  {
    value: 'SPORTS',
    label: 'Sports',
    emoji: '⚽',
    color: '#06D6A0',
    ringColor: 'rgba(6, 214, 160, 0.4)',
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-700 dark:text-green-400'
  },
  {
    value: 'OTHER',
    label: 'Other',
    emoji: '📍',
    color: '#6B7280',
    ringColor: 'rgba(107, 114, 128, 0.4)',
    bg: 'bg-neutral-500/10 dark:bg-neutral-500/20',
    text: 'text-neutral-700 dark:text-neutral-400'
  }
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]['value'];

/**
 * Keyed lookup map for category styles.
 * Includes a virtual `ALL` entry used by the web sidebar filter UI.
 * Built from `EVENT_CATEGORIES` so there is a single source of truth.
 */
export const CATEGORY_DETAILS: Record<string, CategoryStyle> = {
  ALL: {
    emoji: '✨',
    label: 'All Events',
    color: '#10B981',
    ringColor: 'rgba(16, 185, 129, 0.4)',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400'
  },
  ...Object.fromEntries(
    EVENT_CATEGORIES.map((cat) => [cat.value, cat as unknown as CategoryStyle])
  )
};
