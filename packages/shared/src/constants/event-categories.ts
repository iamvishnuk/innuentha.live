export const EVENT_CATEGORIES = [
  {
    value: 'POORAM',
    label: 'Pooram'
  },
  {
    value: 'PERUNNAL',
    label: 'Perunnal'
  },
  {
    value: 'NERCHA',
    label: 'Nercha'
  },
  {
    value: 'TEMPLE_FESTIVAL',
    label: 'Temple Festival'
  },
  {
    value: 'COLLEGE_FEST',
    label: 'College Fest'
  },
  {
    value: 'FOOD_FESTIVAL',
    label: 'Food Festival'
  },
  {
    value: 'MUSIC_CONCERT',
    label: 'Music Concert'
  },
  {
    value: 'DJ_EVENT',
    label: 'DJ Event'
  },
  {
    value: 'EXHIBITION',
    label: 'Exhibition'
  },
  {
    value: 'SPORTS',
    label: 'Sports'
  },
  {
    value: 'OTHER',
    label: 'Other'
  }
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]['value'];
