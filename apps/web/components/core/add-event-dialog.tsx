import { ReactNode } from 'react';
import Link from 'next/link';
import { LogIn, UserCheck, Sparkles, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@innuentha/ui/components/dialog';

interface AddEventDialogProps {
  children: ReactNode;
}

export function AddEventDialog({ children }: AddEventDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='border border-neutral-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-md dark:border-[#1F2A24]/60 dark:bg-[#111714]/95'>
        {/* Subtle glow backgrounds */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-xl'>
          <div className='absolute -top-10 -left-10 size-40 rounded-full bg-green-500/10 blur-2xl' />
          <div className='absolute -right-10 -bottom-10 size-40 rounded-full bg-orange-500/10 blur-2xl' />
        </div>

        <DialogHeader className='relative z-10 space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'>
              <Sparkles className='size-4 animate-pulse' />
            </div>
            <DialogTitle className='font-caveat-brush text-3xl font-semibold tracking-wide text-green-700 dark:text-green-400'>
              Add Event
            </DialogTitle>
          </div>
          <DialogDescription className='font-inter text-sm text-neutral-500 dark:text-neutral-400'>
            Choose how you want to publish your live event to the Kerala
            community map.
          </DialogDescription>
        </DialogHeader>

        <div className='relative z-10 flex flex-col gap-4 py-4'>
          {/* Option 1: Login & Add Event */}
          <DialogClose asChild>
            <Link
              href='/login?next=/add-events'
              className='group flex items-start gap-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-green-500/40 hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/5 active:translate-y-0 active:scale-[0.99] dark:border-green-500/10 dark:bg-green-500/[0.03] dark:hover:border-green-500/30 dark:hover:bg-green-500/[0.08]'
            >
              <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 transition-transform duration-300 group-hover:scale-110 dark:bg-green-500/20 dark:text-green-400'>
                <LogIn className='size-5' />
              </div>
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-1.5 font-inter text-sm font-semibold text-green-700 dark:text-green-400'>
                  Login & Add Event
                  <ChevronRight className='size-3.5 transition-transform duration-300 group-hover:translate-x-0.5' />
                </div>
                <p className='font-inter text-xs leading-relaxed text-neutral-500 dark:text-neutral-400'>
                  Add events under your verified profile. Best for organizers,
                  recurring hosts, and tracking event statistics.
                </p>
              </div>
            </Link>
          </DialogClose>

          {/* Option 2: Add Event Anonymously */}
          <DialogClose asChild>
            <Link
              href='/add-events?anonymous=true'
              className='group flex items-start gap-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/40 hover:bg-orange-500/10 hover:shadow-lg hover:shadow-orange-500/5 active:translate-y-0 active:scale-[0.99] dark:border-orange-500/10 dark:bg-orange-500/[0.03] dark:hover:border-orange-500/30 dark:hover:bg-orange-500/[0.08]'
            >
              <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 transition-transform duration-300 group-hover:scale-110 dark:bg-orange-500/20 dark:text-orange-400'>
                <UserCheck className='size-5' />
              </div>
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-1.5 font-inter text-sm font-semibold text-orange-600 dark:text-orange-400'>
                  Add Event Anonymously
                  <ChevronRight className='size-3.5 transition-transform duration-300 group-hover:translate-x-0.5' />
                </div>
                <p className='font-inter text-xs leading-relaxed text-neutral-500 dark:text-neutral-400'>
                  Quickly publish an event without creating an account. Perfect
                  for one-off local celebrations or temple festivals.
                </p>
              </div>
            </Link>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
