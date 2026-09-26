import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kazakhstan 8-Day Trip Itinerary — Sep 2026',
  description:
    'Complete travel planner for 6 people across Almaty, Charyn Canyon, Kolsai Lakes, Kaindy, and Altyn Emel. Includes day-by-day plan, transport strategy, phrasebook, live weather, currency converter, and interactive map.',
  keywords: ['Kazakhstan', 'Almaty', 'Charyn Canyon', 'Kolsai Lakes', 'travel itinerary', 'Central Asia'],
  openGraph: {
    title: 'Kazakhstan 8-Day Trip Itinerary',
    description: '6 Travelers • Sep 11–18 • Almaty, Charyn, Saty, Altyn Emel',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
