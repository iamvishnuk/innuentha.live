'use client';

import { Icons } from '@/icons';
import { cn } from '@innuentha/ui/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddEventDialog } from '@/components/core/add-event-dialog';
import { createClient } from '@innuentha/supabase/client';
import { User } from '@supabase/supabase-js';
import { User as UserIcon, LogOut, Calendar, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial user
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    // Listen for auth state updates reactively
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
                <AddEventDialog>
                  <button className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'>
                    Add Events
                  </button>
                </AddEventDialog>
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
                  className='flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200/60 bg-white/80 p-1 pr-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98 dark:border-[#1F2A24]/60 dark:bg-[#111714]/80'
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || 'User'}
                      className='size-7 rounded-full object-cover'
                      referrerPolicy='no-referrer'
                    />
                  ) : (
                    <div className='flex size-7 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'>
                      <UserIcon className='size-3.5' />
                    </div>
                  )}
                  <span className='max-w-[120px] truncate font-inter text-xs font-semibold text-neutral-700 dark:text-neutral-300'>
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-neutral-400 transition-transform duration-200',
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
                    <div className='absolute top-full right-0 z-50 mt-2 w-52 origin-top-right rounded-2xl border border-neutral-200/60 bg-white/95 p-1.5 shadow-xl shadow-green-900/5 backdrop-blur-xl dark:border-[#1F2A24]/60 dark:bg-[#111714]/95'>
                      <div className='border-b border-neutral-100 px-3 py-2 dark:border-neutral-800/80'>
                        <p className='font-inter text-[10px] text-neutral-400 dark:text-neutral-500'>
                          Signed in as
                        </p>
                        <p className='truncate font-inter text-xs font-semibold text-neutral-700 dark:text-neutral-200'>
                          {user.email}
                        </p>
                      </div>
                      <div className='space-y-0.5 py-1'>
                        <Link
                          href='/profile'
                          onClick={() => setProfileDropdownOpen(false)}
                          className='flex items-center gap-2 rounded-xl px-3 py-2 font-inter text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
                        >
                          <UserIcon className='size-4 text-green-600 dark:text-green-400' />
                          My Profile
                        </Link>
                        <button
                          type='button'
                          onClick={handleLogout}
                          className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-inter text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
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
                className='flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/5 px-5 py-2 font-inter text-xs font-bold text-green-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-green-500/10 active:translate-y-0 active:scale-98 dark:border-green-500/10 dark:bg-green-500/[0.03] dark:hover:bg-green-500/[0.08]'
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
              <AddEventDialog>
                <button className='cursor-pointer text-green-700 transition-colors duration-300 hover:text-orange-500'>
                  Add Events
                </button>
              </AddEventDialog>
            </li>

            {/* Mobile User Section */}
            <li className='border-t border-neutral-100 pt-4 font-inter text-sm dark:border-neutral-800/80'>
              {isLoading ? (
                <div className='h-8 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800' />
              ) : user ? (
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata.full_name || 'User'}
                        className='size-9 rounded-full object-cover'
                        referrerPolicy='no-referrer'
                      />
                    ) : (
                      <div className='flex size-9 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'>
                        <UserIcon className='size-4.5' />
                      </div>
                    )}
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
                  className='flex w-full items-center justify-center rounded-xl bg-green-700 py-3 font-semibold text-white transition-colors hover:bg-green-800'
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
