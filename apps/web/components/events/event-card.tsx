import { TEventWithUser } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';
import { CategoryStyle } from '@innuentha/shared';
import { cn } from '@innuentha/ui/lib/utils';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';

type EventCardProps = {
  event: TEventWithUser;
  handleSelectEventFromList: (e: TEventWithUser) => void;
  catStyle: CategoryStyle;
};

const EventCard = ({
  event,
  handleSelectEventFromList,
  catStyle
}: EventCardProps) => {
  return (
    <div
      onClick={() => handleSelectEventFromList(event)}
      className='group flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200/40 bg-neutral-50/50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-200 hover:bg-white hover:shadow-lg dark:border-neutral-800/30 dark:bg-neutral-900/30 dark:hover:border-neutral-700/60 dark:hover:bg-neutral-900/80'
    >
      {/* Card Thumbnail Poster */}
      <div className='relative size-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800'>
        <img
          src={event.posterUrl}
          alt={event.eventName}
          className='size-full object-cover'
          onError={(e: any) => {
            e.target.src =
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80';
          }}
        />
      </div>

      {/* Card Metadata */}
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <div className='flex items-center justify-between gap-1'>
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 font-inter text-[9px] font-bold tracking-wider uppercase',
              catStyle.bg,
              catStyle.text
            )}
          >
            {catStyle.label}
          </span>
        </div>

        <h3 className='truncate font-inter text-xs font-bold text-neutral-800 capitalize dark:text-neutral-100'>
          {event.eventName}
        </h3>

        <div className='flex items-center gap-1 truncate text-[10px] font-medium text-neutral-400 dark:text-neutral-500'>
          <Calendar className='size-3 shrink-0' />
          <span className='font-inter'>
            {formatDateRange(event.startDate, event.endDate)}
          </span>
        </div>

        <div className='flex items-center gap-1 truncate text-[10px] font-medium text-neutral-400 dark:text-neutral-500'>
          <MapPin className='size-3 shrink-0' />
          <span className='font-inter'>
            {event.place}, {event.district}
          </span>
        </div>
      </div>

      {/* Mini Arrow Icon */}
      <div className='flex shrink-0 items-center justify-center rounded-full bg-neutral-100/50 p-1 dark:bg-neutral-800/40'>
        <ChevronRight className='size-3.5' />
      </div>
    </div>
  );
};

export default EventCard;
