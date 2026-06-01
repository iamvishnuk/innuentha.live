import { z } from 'zod';

import {
  EVENT_CATEGORIES,
  type EventCategory
} from '../constants/event-categories';

const categoryValues = EVENT_CATEGORIES.map((c) => c.value) as [
  EventCategory,
  ...EventCategory[]
];

export const EventCategorySchema = z.enum(
  categoryValues,
  'Select a valid category'
);

export const AddEventSchema = z.object({
  eventName: z
    .string()
    .trim()
    .min(1, 'Event name is required')
    .max(100, 'Event name must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters'),
  category: EventCategorySchema,
  poster: z
    .custom<File>()
    .refine((file) => file instanceof File, 'Event poster is required')
    .refine((file) => {
      if (!(file instanceof File)) return true;
      return file.size <= 5 * 1024 * 1024;
    }, 'Poster must be less than 5MB'),
  district: z.string().min(1, 'District is required'),
  place: z.string().min(1, 'Place is required'),
  latitude: z
    .number({ message: 'Please select a location on the map' })
    .min(8, 'Location must be within Kerala')
    .max(13, 'Location must be within Kerala'),
  longitude: z
    .number({ message: 'Please select a location on the map' })
    .min(74, 'Location must be within Kerala')
    .max(78, 'Location must be within Kerala'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  organizerName: z.string().optional(),
  sourceLink: z.string().optional(),
  contactNumber: z.string().optional()
});

export type TAddEventSchema = z.infer<typeof AddEventSchema>;
