'use client';

import { Icons } from '@/icons';
import { cn } from '@innuentha/ui/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddEventDialog } from '@/components/core/add-event-dialog';
import { useAuth } from '@/components/auth-provider';
import { createClient } from '@innuentha/supabase/client';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  {
    name: 'About',
    href: '/about'
  }
];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error('Failed to sign out');
    }
  };

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
        <div className='hidden items-center gap-8 md:flex'>
          <nav>
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
                {user ? (
                  <Link
                    href='/add-events'
                    className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'
                  >
                    Add Events
                  </Link>
                ) : (
                  <AddEventDialog>
                    <button className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'>
                      Add Events
                    </button>
                  </AddEventDialog>
                )}
              </li>
            </ul>
          </nav>

          {/* User Account Dropdown / Login Button (Desktop) */}
          <div className='flex items-center gap-4'>
            {isLoading ? (
              <div className='h-9 w-24 animate-pulse rounded-full bg-neutral-200/50 dark:bg-neutral-800/50' />
            ) : user ? (
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className='group flex cursor-pointer items-center gap-2 rounded-full border-2 border-green-700/20 bg-green-500/5 px-2 py-1.5 transition-all duration-300 hover:border-green-700/40 hover:bg-green-500/10 active:scale-95'
                >
                  <div className='flex size-7 items-center justify-center rounded-full bg-green-700/10 text-green-700'>
                    <UserIcon className='size-3.5' />
                  </div>
                  <span className='max-w-[120px] truncate font-caveat-brush text-xl font-semibold text-green-700 transition-colors duration-300 group-hover:text-orange-500'>
                    {user.user_metadata?.full_name?.split(' ')[0] ||
                      user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-green-700/60 transition-transform duration-200',
                      profileDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className='fixed inset-0 z-40'
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className='absolute top-full right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-green-700/15 bg-white/95 p-1.5 shadow-xl shadow-green-900/10 backdrop-blur-xl dark:border-green-900/30 dark:bg-[#0d1510]/95'>
                      <div className='border-b border-green-700/10 px-3 py-2.5 dark:border-green-900/20'>
                        <p className='font-inter text-[10px] font-medium tracking-wider text-green-700/50 uppercase'>
                          Signed in as
                        </p>
                        <p className='mt-0.5 truncate font-caveat-brush text-lg text-green-700 dark:text-green-500'>
                          {user.user_metadata?.full_name ||
                            user.email?.split('@')[0]}
                        </p>
                        <p className='truncate font-inter text-[10px] text-neutral-400'>
                          {user.email}
                        </p>
                      </div>
                      <div className='space-y-0.5 py-1'>
                        <Link
                          href='/profile'
                          onClick={() => setProfileDropdownOpen(false)}
                          className='flex items-center gap-2.5 rounded-xl px-3 py-2 font-inter text-xs font-semibold text-green-700 transition-colors hover:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/10'
                        >
                          <UserIcon className='size-4 text-green-600' />
                          My Profile
                        </Link>
                        <button
                          type='button'
                          onClick={handleLogout}
                          className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-inter text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-500/10'
                        >
                          <LogOut className='size-4' />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href='/login'
                className='rounded-full border-2 border-green-800 px-5 py-1 font-caveat-brush text-2xl font-semibold text-green-800 transition-colors duration-300 hover:text-orange-500'
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className='flex items-center gap-3 md:hidden'>
          <button
            type='button'
            className='flex size-10 items-center justify-center rounded-md text-green-700 transition-colors hover:text-orange-700'
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
      </div>

      {/* Mobile nav dropdown */}
      <div
        className={cn(
          'absolute inset-x-0 top-full z-50 overflow-hidden bg-white transition-all duration-300 ease-in-out md:hidden dark:bg-[#0B0F0C]',
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className='border-t border-orange-700/20 px-6 pt-2 pb-6'>
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
              {user ? (
                <Link
                  href='/add-events'
                  className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'
                >
                  Add Events
                </Link>
              ) : (
                <AddEventDialog>
                  <button className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'>
                    Add Events
                  </button>
                </AddEventDialog>
              )}
            </li>

            {/* Mobile User Section */}
            <li className='border-t border-neutral-100 pt-4 font-inter text-sm dark:border-neutral-800/80'>
              {isLoading ? (
                <div className='h-8 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800' />
              ) : user ? (
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-9 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'>
                      <UserIcon className='size-4.5' />
                    </div>
                    <div className='flex flex-col truncate'>
                      <span className='text-neutral-850 truncate font-semibold dark:text-neutral-200'>
                        {user.user_metadata?.full_name ||
                          user.email?.split('@')[0]}
                      </span>
                      <span className='truncate text-xs text-neutral-400 dark:text-neutral-500'>
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <Link
                      href='/profile'
                      className='dark:text-neutral-350 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-center text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900'
                    >
                      <UserIcon className='text-green-750 size-4 dark:text-green-400' />
                      Profile
                    </Link>
                    <button
                      type='button'
                      onClick={handleLogout}
                      className='flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2 text-center text-xs font-semibold text-red-600 dark:border-red-950/20 dark:bg-red-950/10'
                    >
                      <LogOut className='size-4' />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href='/login'
                  className='flex w-full items-center justify-center rounded-xl bg-green-700 py-2 font-caveat-brush text-2xl font-semibold text-white transition-colors duration-300 hover:bg-orange-500'
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
