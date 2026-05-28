'use client';

import { Icons } from '@/icons';
import { cn } from '@innuentha/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddEventDialog } from '@/components/core/add-event-dialog';

const navItems = [
  {
    name: 'About',
    href: '/about'
  },
  {
    name: 'Events',
    href: '/events'
  }
];

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className='absolute top-0 z-50 w-full border-b border-neutral-200/40 bg-white/10 backdrop-blur-sm dark:border-neutral-800/40 dark:bg-[#0B0F0C]/70'>
      <div className='relative flex items-center justify-between px-6 py-3 md:px-10'>
        <Link
          href='/'
          className='flex items-center justify-center gap-3 md:gap-5'
        >
          <Icons.logo className='size-12 md:size-28' />
          <div className='flex flex-col select-none'>
            <div className='font-caveat-brush text-3xl font-bold md:text-5xl'>
              <span className='text-green-700'>innu</span>
              <span className='text-orange-500'>entha</span>
              <span className='text-base text-green-700 md:text-xl'>.live</span>
            </div>
            <div className='flex w-full items-center gap-1'>
              <span className='h-px w-full bg-orange-500' />
              <span className='font-inter text-[10px] font-medium text-nowrap text-green-700 md:text-xs'>
                KERALA LIVE EVENTS MAP
              </span>
              <span className='h-px w-full bg-orange-500' />
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className='hidden md:block'>
          <ul className='flex items-center gap-5 font-caveat-brush text-2xl font-semibold'>
            {navItems.map((item, index) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors duration-300',
                    pathname === item.href
                      ? 'text-orange-500'
                      : 'text-green-700 hover:text-orange-500'
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li key='Add Events'>
              <AddEventDialog>
                <button className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'>
                  Add Events
                </button>
              </AddEventDialog>
            </li>
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button
          type='button'
          className='flex size-10 items-center justify-center rounded-md text-green-700 transition-colors hover:text-orange-700 md:hidden'
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='size-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18 18 6M6 6l12 12'
              />
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='size-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      <div
        className={cn(
          'absolute inset-x-0 top-full z-50 overflow-hidden bg-white transition-all duration-300 ease-in-out md:hidden dark:bg-[#0B0F0C]',
          mobileMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className='border-t border-orange-700/20 px-6 pt-2 pb-4'>
          <ul className='flex flex-col gap-5 font-caveat-brush text-2xl font-semibold'>
            {navItems.map((item, index) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors duration-300',
                    pathname === item.href
                      ? 'text-orange-500'
                      : 'text-green-700 hover:text-orange-500'
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li key='Add Events'>
              <AddEventDialog>
                <button className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'>
                  Add Events
                </button>
              </AddEventDialog>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
