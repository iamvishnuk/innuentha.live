const MapLoader = () => {
  return (
    <div className='flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-white dark:bg-[#0B0F0C]'>
      <div className='relative flex items-center justify-center'>
        <div className='absolute inset-0 size-16 animate-pulse rounded-full border-4 border-emerald-500/10 dark:border-emerald-500/5'></div>
        <div className='absolute inset-0 size-16 animate-spin rounded-full border-t-4 border-emerald-600 dark:border-emerald-500'></div>
        <span className='animate-bounce text-2xl'>🌴</span>
      </div>
      <div className='space-y-1 text-center'>
        <h3 className='font-caveat-brush text-3xl font-bold text-emerald-700 dark:text-emerald-500'>
          innuentha.live
        </h3>
        <p className='font-inter text-xs font-medium tracking-wide text-neutral-400 uppercase'>
          Kerala Live Events Map Loading...
        </p>
      </div>
    </div>
  );
};

export default MapLoader;
