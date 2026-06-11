import { List } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

type SidebarToggleProps = {
  count: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

const SidebarToggle = ({
  count,
  isSidebarOpen,
  setIsSidebarOpen
}: SidebarToggleProps) => {
  if (isSidebarOpen) return null;

  return (
    <button
      onClick={() => setIsSidebarOpen(true)}
      className='absolute top-[85px] left-4 z-40 flex cursor-pointer items-center gap-2 rounded-2xl border border-neutral-200/50 bg-white/90 px-4 py-3 font-inter text-xs font-bold text-neutral-800 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-neutral-100 active:scale-95 md:top-[150px] dark:border-neutral-800/50 dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:bg-neutral-800'
    >
      <List className='size-4 text-green-600 dark:text-green-400' />
      Show Events List
      <span className='flex size-5 items-center justify-center rounded-full bg-green-500/10 text-[10px] font-black text-green-700 dark:bg-green-500/20 dark:text-green-400'>
        {count}
      </span>
    </button>
  );
};

export default SidebarToggle;
