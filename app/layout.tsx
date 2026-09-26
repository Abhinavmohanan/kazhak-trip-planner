import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6C63FF',
};

export const metadata: Metadata = {
  title: 'KZ Trip — Kazakhstan 8-Day Itinerary',
  description:
    'Complete tactile travel companion for 6 people across Almaty, Charyn Canyon, Kolsai Lakes, Kaindy, and Altyn Emel. Live weather, interactive map, phrasebook, currency converter.',
  keywords: ['Kazakhstan', 'Almaty', 'Charyn Canyon', 'Kolsai Lakes', 'travel itinerary', 'Central Asia'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KZ Trip',
  },
  openGraph: {
    title: 'Kazakhstan 8-Day Trip Itinerary',
    description: '6 Travelers • Oct 11–18 • Almaty, Charyn, Saty, Altyn Emel',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${dmSans.variable}`}>
      <head>
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KZ Trip" />
        {/* Android PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased transition-colors duration-300">{children}</body>
    </html>
  );
}
