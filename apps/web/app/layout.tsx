import {
  Caveat_Brush,
  Geist,
  Geist_Mono,
  Inter,
  Manrope
} from 'next/font/google';

import '@innuentha/ui/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@innuentha/ui/lib/utils';
import { Metadata } from 'next';
import Header from '@/components/core/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin']
});

const caveatBrush = Caveat_Brush({
  variable: '--font-caveat-brush',
  subsets: ['latin'],
  weight: ['400']
});

export const metadata: Metadata = {
  title: {
    template:
      '%s | Innuentha.live – Discover Live Events & Festivals Across Kerala',
    default: 'Innuentha - Kerala Live Events & Festivals Map'
  },
  description:
    'Discover live events happening across Kerala including poorams, perunnals, temple festivals, college fests, food festivals, DJ nights, and cultural programs on an interactive live map.',
  metadataBase: new URL('https://innuentha.live'),
  openGraph: {
    title: 'Innuentha - Kerala Live Events & Festivals Map',
    description:
      'Discover live events happening across Kerala including poorams, perunnals, temple festivals, college fests, food festivals, DJ nights, and cultural programs on an interactive live map.'
  }
};

import { Providers } from '@/components/providers';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'antialiased',
        'font-sans',
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        manrope.variable,
        caveatBrush.variable
      )}
    >
      <body className='relative min-h-dvh w-full bg-white dark:bg-gradient-to-b dark:from-[#0B0F0C] dark:via-[#101512] dark:to-[#0A0A0A]'>
        <ThemeProvider>
          <Providers>
            <Header />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
