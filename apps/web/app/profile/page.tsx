'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@innuentha/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  getUserProfileQueryFn,
  updateProfileMutationFn,
  getMySubmissionsQueryFn
} from '@/lib/api';
import { Input } from '@innuentha/ui/components/input';
import {
  User as UserIcon,
  Mail,
  Lock,
  Edit2,
  Check,
  X,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Editable fields state
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsSessionLoading(false);
      if (!user) {
        router.push('/login');
      }
    });
  }, [router]);

  // Fetch profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: getUserProfileQueryFn,
    enabled: !!user
  });

  // Fetch submissions
  const { data: submissions, isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ['my-submissions', user?.id],
    queryFn: getMySubmissionsQueryFn,
    enabled: !!user
  });

  // Initialize input value when profile data lands
  useEffect(() => {
    if (profile?.fullName) {
      setFullNameInput(profile.fullName);
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfileMutationFn,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
      toast.success('Profile updated successfully');
      setIsEditingName(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleSaveName = () => {
    if (!fullNameInput.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }
    updateProfileMutation.mutate({ fullName: fullNameInput.trim() });
  };

  const handleCancelName = () => {
    setFullNameInput(profile?.fullName || '');
    setIsEditingName(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className='inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400'>
            <CheckCircle className='size-3.5' /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className='text-red-650 inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold dark:bg-red-500/20 dark:text-red-400'>
            <XCircle className='size-3.5' /> Rejected
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'>
            <Clock className='size-3.5' /> Pending Review
          </span>
        );
    }
  };

  if (isSessionLoading || !user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white dark:bg-[#0B0F0C]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='size-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent' />
          <p className='font-inter text-sm text-neutral-500 dark:text-neutral-400'>
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  const isLoadingData = isProfileLoading || isSubmissionsLoading;

  return (
    <div className='relative min-h-screen w-full bg-white px-6 py-10 pt-22 md:pt-40 lg:px-16 dark:bg-gradient-to-b dark:from-[#0B0F0C] dark:via-[#101512] dark:to-[#0A0A0A]'>
      {/* Decorative background elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-32 -left-32 size-96 rounded-full bg-green-500/5 blur-3xl dark:bg-green-500/10' />
        <div className='absolute -right-32 bottom-0 size-96 rounded-full bg-orange-500/5 blur-3xl dark:bg-orange-500/10' />
      </div>

      <div className='relative mx-auto max-w-7xl space-y-8'>
        {/* Title */}
        <div className='space-y-2 text-center md:text-left'>
          <h1 className='text-green-750 font-caveat-brush text-4xl font-bold md:text-6xl dark:text-green-500'>
            My Dashboard
          </h1>
          <p className='font-inter text-sm text-neutral-500 dark:text-neutral-400'>
            Manage your account profiles and track your event submissions.
          </p>
        </div>

        {isLoadingData ? (
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* Left Card Skeleton */}
            <div className='h-80 animate-pulse rounded-3xl border border-neutral-200/60 bg-white/50 p-6 dark:border-[#1F2A24]/60 dark:bg-[#111714]/50' />
            {/* Right Dashboard Skeleton */}
            <div className='animate-pulse space-y-4 lg:col-span-2'>
              <div className='h-12 w-48 rounded bg-neutral-200 dark:bg-neutral-800' />
              <div className='h-32 rounded-3xl bg-neutral-200/50 dark:bg-neutral-800/50' />
              <div className='h-32 rounded-3xl bg-neutral-200/50 dark:bg-neutral-800/50' />
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-3'>
            {/* PROFILE CARD */}
            <div className='rounded-3xl border border-neutral-200/60 bg-white/80 p-8 shadow-xl shadow-green-900/5 backdrop-blur-xl dark:border-[#1F2A24]/60 dark:bg-[#111714]/80 dark:shadow-black/20'>
              <div className='flex flex-col items-center space-y-6 text-center'>
                {/* Avatar */}
                <div className='group relative'>
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName || 'User'}
                      className='size-24 rounded-full border-4 border-green-500/20 object-cover shadow-md transition-transform duration-300 group-hover:scale-105'
                      referrerPolicy='no-referrer'
                    />
                  ) : (
                    <div className='flex size-24 items-center justify-center rounded-full border-4 border-green-500/20 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'>
                      <UserIcon className='size-10' />
                    </div>
                  )}
                  <span className='absolute right-1 bottom-0 flex size-5 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white ring-2 ring-white dark:bg-green-500 dark:ring-[#111714]'>
                    ✓
                  </span>
                </div>

                {/* Name Editor */}
                <div className='w-full space-y-1'>
                  {isEditingName ? (
                    <div className='flex w-full items-center justify-center gap-1.5'>
                      <Input
                        type='text'
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder='Enter full name'
                        className='h-9 w-full max-w-[200px] text-center'
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={updateProfileMutation.isPending}
                        className='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50'
                        aria-label='Save name'
                      >
                        <Check className='size-4' />
                      </button>
                      <button
                        onClick={handleCancelName}
                        className='flex size-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-[#0B0F0C] dark:text-neutral-300'
                        aria-label='Cancel editing'
                      >
                        <X className='size-4' />
                      </button>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center gap-2'>
                      <h2 className='font-caveat-brush text-3xl font-bold text-neutral-800 dark:text-neutral-100'>
                        {profile?.fullName || 'Anonymous Contributor'}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className='inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-green-700 dark:hover:bg-neutral-800/80'
                        aria-label='Edit name'
                      >
                        <Edit2 className='size-3.5' />
                      </button>
                    </div>
                  )}
                  <p className='font-inter text-xs text-neutral-400 dark:text-neutral-500'>
                    Contributor ID: {profile?.id.substring(0, 8)}...
                  </p>
                </div>

                <hr className='dark:border-neutral-850 w-full border-neutral-100' />

                {/* Email details (Read-only) */}
                <div className='w-full space-y-2.5 text-left'>
                  <div className='flex flex-col space-y-1.5'>
                    <label className='font-inter text-xs font-semibold text-green-700 dark:text-green-500'>
                      Verified Email
                    </label>
                    <div className='relative flex w-full items-center'>
                      <Mail className='absolute left-3 size-4 text-neutral-400' />
                      <input
                        type='email'
                        disabled
                        value={profile?.email || ''}
                        className='h-10 w-full cursor-not-allowed rounded-lg border border-neutral-200/80 bg-neutral-50/50 pr-10 pl-10 font-inter text-sm text-neutral-500 select-none dark:border-neutral-800/80 dark:bg-neutral-900/50'
                      />
                      <span
                        className='absolute right-3'
                        title='Email is read-only'
                      >
                        <Lock className='size-3.5 text-neutral-400/80' />
                      </span>
                    </div>
                    <span className='flex items-center gap-1.5 font-inter text-[10px] text-neutral-400 dark:text-neutral-500'>
                      <AlertCircle className='size-3 text-orange-500' />
                      Email verified via Google and cannot be modified.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EVENT SUBMISSIONS */}
            <div className='space-y-6 lg:col-span-2'>
              <div className='dark:border-neutral-850 flex items-center justify-between border-b border-neutral-100 pb-3'>
                <h3 className='text-neutral-850 font-caveat-brush text-2xl font-bold md:text-3xl dark:text-neutral-100'>
                  My Submissions ({submissions?.length || 0})
                </h3>
                <Link
                  href='/add-events'
                  className='bg-green-750 flex items-center gap-1.5 rounded-full px-4 py-2 font-inter text-xs font-bold text-white transition-colors hover:bg-green-800'
                >
                  <PlusCircle className='size-4' /> New Event
                </Link>
              </div>

              {!submissions || submissions.length === 0 ? (
                <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white/40 p-12 text-center dark:border-[#1F2A24]/60 dark:bg-[#111714]/40'>
                  <div className='mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'>
                    <Calendar className='size-7' />
                  </div>
                  <h4 className='mb-1 font-inter text-base font-semibold text-neutral-800 dark:text-neutral-200'>
                    No submissions found
                  </h4>
                  <p className='mb-6 max-w-sm font-inter text-xs text-neutral-400 dark:text-neutral-500'>
                    Help the community by submitting cultural programs, temple
                    festivals, church perunnals, college fests, or food events.
                  </p>
                  <Link
                    href='/add-events'
                    className='rounded-xl bg-green-700 px-6 py-2.5 font-inter text-xs font-bold text-white transition-colors hover:bg-green-800'
                  >
                    Submit Your First Event
                  </Link>
                </div>
              ) : (
                <div className='space-y-4'>
                  {submissions.map((event: any) => (
                    <div
                      key={event.id}
                      className='group flex flex-col items-stretch overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/70 shadow-sm transition-all hover:shadow-md sm:flex-row dark:border-[#1F2A24]/60 dark:bg-[#111714]/70'
                    >
                      {/* Event Poster Thumbnail */}
                      <div className='relative h-36 w-full shrink-0 overflow-hidden bg-neutral-100 sm:w-36 dark:bg-neutral-900'>
                        {event.posterUrl ? (
                          <img
                            src={event.posterUrl}
                            alt={event.eventName}
                            className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex size-full items-center justify-center text-neutral-400'>
                            <Calendar className='size-8' />
                          </div>
                        )}
                      </div>

                      {/* Event details */}
                      <div className='flex flex-1 flex-col justify-between space-y-4 p-6 sm:space-y-0'>
                        <div className='space-y-1.5'>
                          <div className='flex flex-wrap items-center gap-2'>
                            {getStatusBadge(event.status)}
                            <span className='rounded-full bg-neutral-100 px-2 py-0.5 font-inter text-[10px] font-semibold tracking-wider text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-400'>
                              {event.category}
                            </span>
                          </div>
                          <h4 className='text-neutral-850 font-inter text-base font-bold transition-colors group-hover:text-green-700 dark:text-neutral-100 dark:group-hover:text-green-400'>
                            {event.eventName}
                          </h4>
                          <div className='flex flex-wrap gap-x-4 gap-y-1 font-inter text-xs text-neutral-500 dark:text-neutral-400'>
                            <span className='flex items-center gap-1'>
                              <MapPin className='size-3.5 text-neutral-400' />
                              {event.place}, {event.district}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='size-3.5 text-neutral-400' />
                              {formatDate(event.startDate)}
                              {event.endDate &&
                                event.endDate !== event.startDate &&
                                ` - ${formatDate(event.endDate)}`}
                            </span>
                          </div>
                        </div>

                        {/* Rejection notice box */}
                        {event.status === 'rejected' &&
                          event.rejectionReason && (
                            <div className='flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3'>
                              <AlertCircle className='mt-0.5 size-4 shrink-0 text-red-500' />
                              <div className='font-inter text-xs leading-relaxed text-red-700 dark:text-red-400'>
                                <span className='font-bold'>
                                  Rejection Reason:
                                </span>{' '}
                                {event.rejectionReason}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
