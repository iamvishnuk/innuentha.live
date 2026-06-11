import type { TEvent, TProfile } from '@innuentha/supabase/schema';

export type { TEvent, TProfile };

export type TEventWithUser = TEvent & {
  user: Pick<TProfile, 'fullName' | 'avatarUrl'> | null;
};
