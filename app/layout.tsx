import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: 'KZ Trip — Kazakhstan 8-Day Itinerary',
  description:
    'Complete travel planner for 6 people across Almaty, Charyn Canyon, Kolsai Lakes, Kaindy, and Altyn Emel. Live weather, interactive map, phrasebook, currency converter.',
  keywords: ['Kazakhstan', 'Almaty', 'Charyn Canyon', 'Kolsai Lakes', 'travel itinerary', 'Central Asia'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KZ Trip',
  },
  openGraph: {
    title: 'Kazakhstan 8-Day Trip Itinerary',
    description: '6 Travelers • Sep 11–18 • Almaty, Charyn, Saty, Altyn Emel',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KZ Trip" />
        {/* Android PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
