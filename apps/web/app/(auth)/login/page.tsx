'use client';

import { createClient } from '@innuentha/supabase/client';

const LoginPage = () => {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    let redirectTo = `${window.location.origin}/auth/callback`;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      if (next) {
        redirectTo += `?next=${encodeURIComponent(next)}`;
      }
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false
      }
    });
  };

  return (
    <div className='relative flex min-h-screen w-full justify-center pt-16 md:pt-35'>
      {/* Decorative background elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-32 -left-32 size-96 rounded-full bg-green-500/5 blur-3xl dark:bg-green-500/10' />
        <div className='absolute -right-32 bottom-0 size-96 rounded-full bg-orange-500/5 blur-3xl dark:bg-orange-500/10' />
      </div>

      <div className='relative flex flex-col items-center px-6 py-10 lg:px-10'>
        <div className='mb-8 space-y-7 text-center'>
          <h1 className='font-caveat-brush text-5xl font-bold text-green-700 md:text-7xl dark:text-green-500'>
            ഇന്ന് എന്താ?
          </h1>
          <p className='max-w-md font-inter text-lg leading-relaxed text-neutral-600 md:max-w-xl dark:text-neutral-300'>
            Discover poorams, perunnals, temple festivals, college fests, food
            festivals, DJ nights, and cultural events happening near you — in
            real time.
          </p>
        </div>

        {/* Card */}
        <div className='max-w-md'>
          <div className='rounded-3xl border border-neutral-200/60 bg-white/80 p-8 shadow-xl shadow-green-900/5 backdrop-blur-xl sm:p-10 dark:border-[#1F2A24]/60 dark:bg-[#111714]/80 dark:shadow-black/20'>
            <div className='space-y-8'>
              {/* Heading */}
              <div className='space-y-4 text-center'>
                <div className='inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 dark:border-orange-800/30 dark:bg-orange-950/20'>
                  <span className='size-1.5 rounded-full bg-orange-500' />
                  <span className='font-inter text-xs font-medium text-orange-600 dark:text-orange-400'>
                    Kerala Live Events
                  </span>
                </div>

                <div className='space-y-2'>
                  <h2 className='font-caveat-brush text-5xl text-green-700 dark:text-green-500'>
                    Welcome Back
                  </h2>
                  <p className='font-inter text-sm leading-relaxed text-neutral-500 dark:text-neutral-400'>
                    Sign in to discover live events happening across Kerala
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className='flex items-center gap-4'>
                <span className='h-px flex-1 bg-gradient-to-r from-transparent to-neutral-200 dark:to-neutral-700' />
                <span className='font-inter text-xs text-neutral-400'>
                  sign in with
                </span>
                <span className='h-px flex-1 bg-gradient-to-l from-transparent to-neutral-200 dark:to-neutral-700' />
              </div>

              {/* Google Login Button */}
              <button
                type='button'
                onClick={() => {
                  console.log('button clicked');
                  handleGoogleLogin();
                }}
                className='group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-4 font-inter text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10 active:translate-y-0 active:scale-[0.98] dark:border-neutral-700 dark:bg-[#0B0F0C] dark:text-neutral-200 dark:hover:border-green-700 dark:hover:shadow-green-500/5'
              >
                <svg
                  viewBox='0 0 24 24'
                  className='size-5 transition-transform duration-300 group-hover:scale-110'
                  aria-hidden='true'
                >
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                </svg>
                Continue with Google
              </button>

              {/* Footer */}
              <p className='text-center font-inter text-xs leading-relaxed text-neutral-400 dark:text-neutral-500'>
                By continuing, you agree to help build Kerala&apos;s live
                cultural events community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
