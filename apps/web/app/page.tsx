'use client';

import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import MapLoader from '@/loaders/map-loader';
import { AddEventDialog } from '@/components/core/add-event-dialog';

const KeralaMap = dynamic(() => import('@innuentha/map/kerala-map'), {
  ssr: false,
  loading: () => <MapLoader />
});

export default function Page() {
  return (
    <main className='relative h-dvh w-full overflow-hidden'>
      <KeralaMap />

      {/* Mobile-only Floating Add Event Button */}
      <AddEventDialog>
        <button
          className='absolute flex cursor-pointer items-center gap-1 rounded-full px-6 py-3 font-inter text-sm font-bold text-white md:hidden'
          style={{
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'oklch(52.7% 0.154 150.069)',
            zIndex: 9999
          }}
        >
          <Plus className='size-4' /> Add Event
        </button>
      </AddEventDialog>
    </main>
  );
}
