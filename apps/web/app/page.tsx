'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import MapLoader from '@/loaders/map-loader';
import { AddEventDialog } from '@/components/core/add-event-dialog';
import { useQuery } from '@tanstack/react-query';
import { getEventsQueryFn } from '@/lib/api';
import { TEvent } from '@innuentha/supabase/schema';
import EventDetailDialog from '@/components/events/event-detail-dialog';
import SidebarToggle from '@/components/events/sidebar-toggle';
import Sidebar from '@/components/events/sidebar';
import { CATEGORY_DETAILS, CategoryStyle } from '@innuentha/shared';
import { useUserLocation } from '@/hooks/use-user-location';
import { useAuth } from '@/components/auth-provider';

const KeralaMap = dynamic(() => import('@innuentha/map/kerala-map'), {
  ssr: false,
  loading: () => <MapLoader />
});

export default function Page() {
  const userLocation = useUserLocation();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEventsQueryFn
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<TEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [flyToEventId, setFlyToEventId] = useState<string | null>(null);

  const selectedCatStyle = useMemo<CategoryStyle>(() => {
    return (CATEGORY_DETAILS[selectedEvent?.category ?? ''] ??
      CATEGORY_DETAILS.OTHER) as CategoryStyle;
  }, [selectedEvent]);

  // Extract events array from axios response wrapper safely
  const rawEventsList = useMemo(() => {
    return (data as any)?.data?.events || [];
  }, [data]);

  // Show only approved events on the interactive map
  const approvedEvents = useMemo(() => {
    return rawEventsList.filter((e: TEvent) => e.status === 'approved');
  }, [rawEventsList]);

  // Filter events based on search query and category filters
  const filteredEvents = useMemo(() => {
    return approvedEvents.filter((event: TEvent) => {
      const matchesCategory =
        selectedCategory === 'ALL' || event.category === selectedCategory;

      const searchableText =
        `${event.eventName} ${event.place} ${event.district} ${event.description}`.toLowerCase();
      const matchesSearch = searchableText.includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [approvedEvents, selectedCategory, searchQuery]);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 768);
  }, []);

  // Clean up flyTo state after triggering
  useEffect(() => {
    if (flyToEventId) {
      const timer = setTimeout(() => setFlyToEventId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [flyToEventId]);

  const handleSelectEventFromList = (event: TEvent) => {
    setFlyToEventId(event.id);
    // On mobile, collapse the drawer so the user sees the map popup fly animation clearly
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <main className='relative h-dvh w-full overflow-hidden bg-background'>
      {/* Map Component */}
      <KeralaMap
        events={filteredEvents}
        onSelectEvent={setSelectedEvent}
        selectedEventId={flyToEventId}
        userLocation={userLocation}
      />

      {/* Floating Toggle Sidebar Button (When Sidebar is Closed) */}
      <SidebarToggle
        events={filteredEvents}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        events={filteredEvents}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isLoading={isLoading}
        handleSelectEventFromList={handleSelectEventFromList}
      />

      {/* Floating Add Event Button (Mobile) */}
      <div className='absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 md:hidden'>
        {user ? (
          <Link
            href='/add-events'
            className='flex cursor-pointer items-center gap-1.5 rounded-full bg-[oklch(52.7%_0.154_150.069)] px-5 py-3 font-inter text-xs font-bold text-white shadow-xl transition-all active:scale-95'
          >
            <Plus className='size-4' /> Add Event
          </Link>
        ) : (
          <AddEventDialog>
            <button className='flex cursor-pointer items-center gap-1.5 rounded-full bg-[oklch(52.7%_0.154_150.069)] px-5 py-3 font-inter text-xs font-bold text-white shadow-xl transition-all active:scale-95'>
              <Plus className='size-4' /> Add Event
            </button>
          </AddEventDialog>
        )}
      </div>

      <EventDetailDialog
        event={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        selectedCatStyle={selectedCatStyle}
      />
    </main>
  );
}
