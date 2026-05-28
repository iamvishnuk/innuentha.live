const MapLoader = () => {
  return (
    <div className='flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-white dark:bg-[#0B0F0C]'>
      <div className='relative flex items-center justify-center'>
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
