const EventCardLoader = () => {
  return (
    <div className='flex animate-pulse items-center gap-3 rounded-2xl border border-neutral-200/30 bg-neutral-100/30 p-3 dark:border-neutral-800/30 dark:bg-neutral-900/30'>
      <div className='size-14 rounded-xl bg-neutral-200 dark:bg-neutral-800' />
      <div className='flex-1 space-y-2 py-0.5'>
        <div className='h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800' />
        <div className='h-2.5 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800' />
        <div className='h-2 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800' />
      </div>
    </div>
  );
};

export default EventCardLoader;
