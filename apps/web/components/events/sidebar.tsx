import { CATEGORY_DETAILS } from '@innuentha/shared';
import { formatDateRange } from '@/lib/utils';
import { TEvent } from '@innuentha/supabase/schema';
import {
  Sparkles,
  ChevronLeft,
  Search,
  X,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import EventCardLoader from '@/loaders/event-card-loader';
import { cn } from '@innuentha/ui/lib/utils';

type SidebarProps = {
  isSidebarOpen: boolean;
  events: TEvent[];
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  handleSelectEventFromList: (data: TEvent) => void;
};

const Sidebar = ({
  isSidebarOpen,
  events,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  isLoading,
  handleSelectEventFromList
}: SidebarProps) => {
  return (
    <div
      className={`fixed top-[70px] bottom-0 left-0 z-30 flex h-[calc(100dvh-80px)] w-full flex-col border-t border-neutral-200/40 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out md:absolute md:top-[150px] md:bottom-6 md:left-6 md:h-[calc(100dvh-160px)] md:w-[380px] md:rounded-3xl md:border md:bg-white/80 dark:border-neutral-800/40 dark:bg-[#0B0F0C]/95 md:dark:bg-[#0B0F0C]/85 ${
        isSidebarOpen
          ? 'translate-x-0'
          : '-translate-x-full md:invisible md:opacity-0'
      }`}
    >
      {/* Sidebar Header */}
      <div className='flex items-center justify-between border-b border-neutral-200/40 px-5 py-4 dark:border-neutral-800/40'>
        <div className='flex items-center gap-2'>
          <div className='flex size-7 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'>
            <Sparkles className='size-3.5 animate-pulse' />
          </div>
          <h2 className='font-caveat-brush text-2xl font-bold tracking-wide text-green-700 dark:text-green-400'>
            Discover Events
          </h2>
        </div>

        <div className='flex items-center gap-2'>
          <span className='rounded-full bg-neutral-100 px-2 py-0.5 font-inter text-[10px] font-bold text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400'>
            {events.length} {events.length === 1 ? 'Event' : 'Events'}
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className='flex size-7 cursor-pointer items-center justify-center rounded-full bg-neutral-100/60 text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-800'
            aria-label='Hide sidebar'
          >
            <ChevronLeft className='size-4' />
          </button>
        </div>
      </div>

      {/* Filters and Search Container */}
      <div className='flex flex-col gap-3 p-4'>
        {/* Search Box */}
        <div className='relative flex items-center rounded-2xl border border-neutral-200/60 bg-neutral-100/40 px-3 py-3 transition-all focus-within:border-neutral-300 focus-within:bg-white dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:focus-within:border-neutral-700 dark:focus-within:bg-neutral-900'>
          <Search className='size-4 shrink-0 text-neutral-400 dark:text-neutral-500' />
          <input
            type='text'
            placeholder='Search event, venue, district...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full bg-transparent px-2.5 font-inter text-sm font-semibold text-neutral-800 outline-none placeholder:font-inter placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800'
            >
              <X className='size-3' />
            </button>
          )}
        </div>

        {/* Category Pill Filters (Horizontally Scrollable) */}
        <div className='scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 flex items-center gap-3 overflow-x-auto px-3 py-5'>
          {Object.entries(CATEGORY_DETAILS).map(([key, style]) => {
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1.5 font-inter text-[11px] font-bold text-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? `${style.bg} ${style.text} scale-105 ring-2 ring-current ring-offset-2 ring-offset-white dark:ring-offset-black`
                    : 'border border-neutral-200/50 bg-neutral-50 font-inter text-neutral-600 dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{style.emoji}</span>
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Events List */}
      <div className='scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 flex-1 space-y-3 overflow-y-auto px-4 pb-4'>
        {isLoading ? (
          // Skeleton Loaders
          Array.from({ length: 3 }).map((_, idx) => (
            <EventCardLoader key={idx} />
          ))
        ) : events.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
            <span className='mb-2 text-3xl'>🗺️</span>
            <p className='font-inter text-xs font-bold text-neutral-500 dark:text-neutral-400'>
              No live events found matching these criteria.
            </p>
            <p className='mt-1 font-inter text-[10px] text-neutral-400 dark:text-neutral-500'>
              Drop a pin or be the first to publish one!
            </p>
          </div>
        ) : (
          events.map((event: TEvent) => {
            const catStyle = (CATEGORY_DETAILS[event.category] ||
              CATEGORY_DETAILS.OTHER)!;
            return (
              <div
                key={event.id}
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
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
