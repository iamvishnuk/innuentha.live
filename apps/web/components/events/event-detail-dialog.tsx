import { TEventWithUser } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';
import { Button } from '@innuentha/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@innuentha/ui/components/dialog';
import {
  Calendar,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Share2,
  User
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

type EventDetailDialogProps = {
  event: TEventWithUser | null;
  selectedCatStyle: {
    emoji: string;
    label: string;
    color: string;
    bg: string;
    text: string;
  };
  setSelectedEvent: Dispatch<SetStateAction<TEventWithUser | null>>;
};

const EventDetailDialog = ({
  event,
  selectedCatStyle,
  setSelectedEvent
}: EventDetailDialogProps) => {
  const handleShareEvent = (event: TEventWithUser) => {
    const text = `Check out "${event.eventName}" on Innuentha.live! Happening at ${event.place}, ${event.district} from ${formatDateRange(event.startDate, event.endDate)}. View on map: https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
    navigator.clipboard.writeText(text);
    toast.success('Event details copied to clipboard!');
  };

  return (
    <Dialog
      open={event !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedEvent(null);
      }}
    >
      <DialogContent className='overflow-hidden border border-neutral-200/60 bg-white/95 p-0 font-inter shadow-2xl backdrop-blur-xl sm:max-w-xl dark:border-[#1F2A24]/60 dark:bg-[#111714]/95'>
        {event && (
          <div className='flex flex-col'>
            {/* Dynamic Overlay Glowing Backgrounds */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-xl'>
              <div
                className='absolute -top-20 -right-20 size-60 rounded-full opacity-15 blur-3xl'
                style={{
                  backgroundColor: selectedCatStyle.color
                }}
              />
            </div>

            {/* Large Resolution Event Poster Header */}
            <div className='relative h-64 w-full overflow-hidden bg-neutral-900'>
              <img
                src={event.posterUrl}
                alt={event.eventName}
                className='size-full object-cover'
                onError={(e: any) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
                }}
              />
              {/* Visual shade gradient */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />

              {/* Floating category badge inside the image */}
              <div className='absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3'>
                <span
                  className='flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm'
                  style={{
                    backgroundColor: selectedCatStyle.color
                  }}
                >
                  <span>{selectedCatStyle.emoji}</span>
                  {selectedCatStyle.label}
                </span>
              </div>
            </div>

            {/* Detail Content Container */}
            <div className='scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 relative z-10 flex max-h-[calc(100vh-22rem)] flex-col gap-4 overflow-y-auto p-6'>
              <div>
                <DialogTitle className='text-xl leading-tight font-bold text-neutral-900 capitalize md:text-2xl dark:text-neutral-50'>
                  {event.eventName}
                </DialogTitle>
              </div>

              {/* Grid Metadata details */}
              <div className='grid grid-cols-1 gap-3.5 rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-4 text-xs font-semibold md:grid-cols-2 dark:border-neutral-800/40 dark:bg-neutral-900/30'>
                <div className='flex items-center gap-3 text-neutral-600 dark:text-neutral-400'>
                  <Calendar className='size-4 shrink-0 text-green-600 dark:text-green-400' />
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                      Date & Duration
                    </span>
                    <span>
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-3 text-neutral-600 dark:text-neutral-400'>
                  <MapPin className='size-4 shrink-0 text-orange-600 dark:text-orange-400' />
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                      Venue Location
                    </span>
                    <span className='truncate'>
                      {event.place}, {event.district}
                    </span>
                  </div>
                </div>

                {event.organizerName && (
                  <div className='flex items-center gap-3 text-neutral-600 dark:text-neutral-400'>
                    <User className='size-4 shrink-0 text-blue-600 dark:text-blue-400' />
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                        Organizer
                      </span>
                      <span>{event.organizerName}</span>
                    </div>
                  </div>
                )}

                {event.contactNumber && (
                  <a
                    href={`tel:${event.contactNumber}`}
                    className='flex items-center gap-3 text-neutral-600 transition-colors hover:text-green-600 dark:text-neutral-400 dark:hover:text-green-400'
                  >
                    <Phone className='size-4 shrink-0 text-purple-600 dark:text-purple-400' />
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                        Contact Call
                      </span>
                      <span>{event.contactNumber}</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Posted by user */}
              {event.user && (
                <div className='flex items-center gap-3 rounded-2xl border border-neutral-200/50 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800/40 dark:bg-neutral-900/30'>
                  <div className='relative shrink-0'>
                    {event.user.avatarUrl ? (
                      <img
                        src={event.user.avatarUrl}
                        alt={event.user.fullName ?? 'User avatar'}
                        className='size-9 rounded-full object-cover ring-2 ring-green-500/30'
                      />
                    ) : (
                      <div className='flex size-9 items-center justify-center rounded-full bg-neutral-200 ring-2 ring-green-500/30 dark:bg-neutral-800'>
                        <User className='size-4 text-neutral-500 dark:text-neutral-400' />
                      </div>
                    )}
                    <span className='absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-green-500 dark:border-[#111714]' />
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                      Posted by
                    </span>
                    <span className='text-xs font-semibold text-neutral-700 dark:text-neutral-200'>
                      {event.user.fullName ?? 'Anonymous'}
                    </span>
                  </div>
                </div>
              )}

              {/* Event Description */}
              <div className='space-y-1.5'>
                <h4 className='text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                  About Event
                </h4>
                <DialogDescription className='text-xs leading-relaxed font-medium whitespace-pre-wrap text-neutral-600 dark:text-neutral-300'>
                  {event.description}
                </DialogDescription>
              </div>

              {/* Full-width premium controls panel */}
              <div className='mt-2 flex flex-col items-center gap-2 border-t border-neutral-200/50 pt-2 md:flex-row dark:border-neutral-800/40'>
                {/* Share button */}
                <Button
                  onClick={() => handleShareEvent(event)}
                  variant='outline'
                  className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-5 text-xs font-bold md:w-auto dark:border-neutral-800'
                >
                  <Share2 className='size-4 shrink-0' />
                  Share Details
                </Button>

                {event.sourceLink && (
                  <a
                    href={event.sourceLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full md:w-auto'
                  >
                    <Button
                      variant='outline'
                      className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-5 text-xs font-bold dark:border-neutral-800'
                    >
                      <ExternalLink className='size-4 shrink-0' />
                      Official Source
                    </Button>
                  </a>
                )}

                {/* Directions to coordinates */}
                <Button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`,
                      '_blank'
                    );
                  }}
                  className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-5 text-xs font-bold text-white md:flex-1'
                  style={{ background: 'oklch(52.7% 0.154 150.069)' }}
                >
                  <Navigation className='size-4 shrink-0' />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailDialog;
