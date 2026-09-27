'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Auto-adjust map center and zoom when day filter changes ────────────────────
function MapViewController({ bounds, center, zoom }: { bounds?: L.LatLngBoundsExpression; center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, bounds, center, zoom]);
  return null;
}

// ── Complete Stops Data with Day Numbers & Descriptions ───────────────────────
export interface MapStop {
  id: string;
  name: string;
  dayBadge: string;
  dayNum: number[];
  lat: number;
  lon: number;
  color: string;
  type: 'base' | 'excursion' | 'roadtrip';
  highlight: string;
  desc: string;
}

const STOPS_PLAN_A: MapStop[] = [
  {
    id: 'almaty',
    name: 'Almaty City Center (Base 1)',
    dayBadge: 'D1/8',
    dayNum: [1, 2, 3, 4, 8],
    lat: 43.2389,
    lon: 76.8897,
    color: '#6C63FF',
    type: 'base',
    highlight: 'Arrival & City Base',
    desc: 'Hotel, Green Bazaar, Zenkov Cathedral, Arasan Baths, Panfilov pedestrian avenue.',
  },
  {
    id: 'medeu',
    name: 'Medeu Ice Rink & Shymbulak',
    dayBadge: 'D2',
    dayNum: [2],
    lat: 43.1575,
    lon: 77.0592,
    color: '#06B6D4',
    type: 'excursion',
    highlight: 'Highest Ice Rink & Cable Car',
    desc: 'Public Bus #12 from Dostyk Ave to Medeu, 3-stage cable car to Talgar Pass (3200m).',
  },
  {
    id: 'bao',
    name: 'Big Almaty Lake (BAO)',
    dayBadge: 'D3',
    dayNum: [3],
    lat: 43.0506,
    lon: 76.9839,
    color: '#0EA5E9',
    type: 'excursion',
    highlight: 'Turquoise Alpine Mirror',
    desc: 'Scenic reservoir in the border patrol zone. Bring original passports! 1.5 hr walk from barrier.',
  },
  {
    id: 'turgen',
    name: 'Turgen Gorge',
    dayBadge: 'D4',
    dayNum: [4],
    lat: 43.3500,
    lon: 77.6200,
    color: '#8B84FF',
    type: 'excursion',
    highlight: 'River Canyon & Waterfalls',
    desc: 'Bear Waterfall stop on the way to Assy Plateau.',
  },
  {
    id: 'assy',
    name: 'Assy Plateau & Observatory',
    dayBadge: 'D4',
    dayNum: [4],
    lat: 43.2260,
    lon: 77.8710,
    color: '#8B84FF',
    type: 'excursion',
    highlight: '2700m Steppe & Soviet Observatory',
    desc: 'Nomadic yurts, wild horse herds, and lone Soviet astronomical dome. Requires 4x4.',
  },
  {
    id: 'charyn',
    name: 'Charyn Canyon (Valley of Castles)',
    dayBadge: 'D5',
    dayNum: [5],
    lat: 43.3512,
    lon: 79.0792,
    color: '#F59E0B',
    type: 'roadtrip',
    highlight: 'Dramatic Red Rock Gorge',
    desc: '2.5 km hike through sandstone towers down to the rushing Charyn River.',
  },
  {
    id: 'black-canyon',
    name: 'Black Canyon Overlook',
    dayBadge: 'D5',
    dayNum: [5],
    lat: 43.2500,
    lon: 78.9600,
    color: '#D97706',
    type: 'roadtrip',
    highlight: 'Vertical Highway Cliff View',
    desc: '20-minute panoramic photo stop directly overlooking the sheer river gorge.',
  },
  {
    id: 'saty',
    name: 'Saty Village (Base 2)',
    dayBadge: 'D5-6',
    dayNum: [5, 6, 7],
    lat: 42.9989,
    lon: 78.4111,
    color: '#10B981',
    type: 'base',
    highlight: 'Family Guesthouse Base',
    desc: 'Homestay hub for Kolsai and Kaindy lakes. Cash only! Home-cooked meals.',
  },
  {
    id: 'kaindy',
    name: 'Lake Kaindy (Sunken Forest)',
    dayBadge: 'D6',
    dayNum: [6],
    lat: 42.9847,
    lon: 78.4656,
    color: '#14B8A6',
    type: 'roadtrip',
    highlight: 'Submerged Birch Forest',
    desc: 'Turquoise lake created by 1911 earthquake. Hire local Soviet UAZ 4x4 van from Saty.',
  },
  {
    id: 'kolsai',
    name: 'Lower Kolsai Lake',
    dayBadge: 'D6',
    dayNum: [6],
    lat: 42.9833,
    lon: 78.3242,
    color: '#14B8A6',
    type: 'roadtrip',
    highlight: 'Alpine Boating & Stroll',
    desc: 'Smooth asphalt road from Saty. Rent wooden rowboat (~5000 KZT) on calm lake.',
  },
  {
    id: 'basshi',
    name: 'Basshi Village (Base 3 / Altyn Emel)',
    dayBadge: 'D7',
    dayNum: [7, 8],
    lat: 44.1683,
    lon: 78.7511,
    color: '#F97316',
    type: 'base',
    highlight: 'National Park HQ',
    desc: 'Register vehicle and obtain entry permits. Gateway to Singing Dunes.',
  },
  {
    id: 'singing-dunes',
    name: 'Singing Dunes',
    dayBadge: 'D7',
    dayNum: [7],
    lat: 43.8667,
    lon: 78.5667,
    color: '#F97316',
    type: 'roadtrip',
    highlight: 'Acoustic Sand Humming',
    desc: '45 km gravel road inside park. Climb the ridge and slide down to hear organ-like humming.',
  },
  {
    id: 'qonaev',
    name: 'Qonaev / Kapchagay Highway',
    dayBadge: 'D8',
    dayNum: [8],
    lat: 43.8753,
    lon: 77.0758,
    color: '#6C63FF',
    type: 'roadtrip',
    highlight: 'Return Highway & Lake View',
    desc: 'Scenic multi-lane A3 tollway passing Lake Kapchagay back to Almaty & ALA airport.',
  },
];

const STOPS_PLAN_B: MapStop[] = [
  {
    id: 'almaty',
    name: 'Almaty City Center (Base 1)',
    dayBadge: 'D1/2/7/8',
    dayNum: [1, 2, 7, 8],
    lat: 43.2389,
    lon: 76.8897,
    color: '#6C63FF',
    type: 'base',
    highlight: 'Arrival & City Hotel',
    desc: 'Hotel base, Green Bazaar, Zenkov Cathedral, Kok Tobe cable car, and car rental pickup.',
  },
  {
    id: 'medeu',
    name: 'Medeu Ice Rink & Shymbulak',
    dayBadge: 'D2',
    dayNum: [2],
    lat: 43.1575,
    lon: 77.0592,
    color: '#06B6D4',
    type: 'excursion',
    highlight: 'Highest Ice Rink & Talgar Pass (3200m)',
    desc: 'Bus #12 to Medeu, 3-stage gondola to Talgar pass snow peaks; car pickup in afternoon.',
  },
  {
    id: 'issyk',
    name: 'Issyk Alpine Lake',
    dayBadge: 'D3',
    dayNum: [3],
    lat: 43.2547,
    lon: 77.4856,
    color: '#0EA5E9',
    type: 'roadtrip',
    highlight: 'Alpine Lake & Turquoise Waters',
    desc: 'Scenic mountain lake 80km east of Almaty. Spectacular autumn slopes and cold mountain winds.',
  },
  {
    id: 'turgen',
    name: 'Turgen Gorge & Bear Waterfall',
    dayBadge: 'D3',
    dayNum: [3],
    lat: 43.3500,
    lon: 77.6200,
    color: '#3B82F6',
    type: 'roadtrip',
    highlight: 'River Canyon & 30m Waterfall',
    desc: 'Scenic river gorge, fresh mountain trout lunch, and hike to Bear Waterfall (Medvezhiy).',
  },
  {
    id: 'chundzha',
    name: 'Chundzha Hot Springs (Base 2)',
    dayBadge: 'D3-4',
    dayNum: [3, 4],
    lat: 43.5350,
    lon: 79.4600,
    color: '#EC4899',
    type: 'base',
    highlight: 'Thermal Mineral Springs Resort',
    desc: 'Naturally heated 38°C–44°C mineral springs pools. Safe arrival before sunset; crisp night soak.',
  },
  {
    id: 'charyn',
    name: 'Charyn Canyon (Valley of Castles)',
    dayBadge: 'D4',
    dayNum: [4],
    lat: 43.3512,
    lon: 79.0792,
    color: '#F59E0B',
    type: 'roadtrip',
    highlight: 'Dramatic Red Rock Gorge',
    desc: 'Morning arrival with golden light. 2.5 km hike through sandstone towers down to Charyn River.',
  },
  {
    id: 'black-canyon',
    name: 'Black Canyon Overlook',
    dayBadge: 'D4',
    dayNum: [4],
    lat: 43.2500,
    lon: 78.9600,
    color: '#D97706',
    type: 'roadtrip',
    highlight: 'Vertical Highway Cliff View',
    desc: 'Panoramic photo stop overlooking deep dark gorge on the road towards Saty.',
  },
  {
    id: 'saty',
    name: 'Saty Village (Base 3)',
    dayBadge: 'D4-6',
    dayNum: [4, 5, 6],
    lat: 42.9989,
    lon: 78.4111,
    color: '#10B981',
    type: 'base',
    highlight: 'Family Guesthouse Base',
    desc: '2 nights homestay for Kolsai and Kaindy lakes. Warm hospitality, hot tea and home cooked meals.',
  },
  {
    id: 'kaindy',
    name: 'Lake Kaindy (Sunken Forest)',
    dayBadge: 'D5',
    dayNum: [5],
    lat: 42.9847,
    lon: 78.4656,
    color: '#14B8A6',
    type: 'roadtrip',
    highlight: 'Submerged Birch Forest',
    desc: 'Turquoise mountain lake created by 1911 quake. Hire local Soviet UAZ 4x4 van from Saty.',
  },
  {
    id: 'kolsai',
    name: 'Lower Kolsai Lake',
    dayBadge: 'D5',
    dayNum: [5],
    lat: 42.9833,
    lon: 78.3242,
    color: '#14B8A6',
    type: 'roadtrip',
    highlight: 'Alpine Boating & Golden Forest',
    desc: 'Smooth asphalt road from Saty. Rent wooden rowboat or walk along picturesque shoreline.',
  },
  {
    id: 'basshi',
    name: 'Basshi Village (Base 4 / Altyn Emel)',
    dayBadge: 'D6-7',
    dayNum: [6, 7],
    lat: 44.1683,
    lon: 78.7511,
    color: '#F97316',
    type: 'base',
    highlight: 'National Park HQ',
    desc: 'Register vehicle, get park permits, and overnight before exploring Singing Dunes & Aktau.',
  },
  {
    id: 'singing-dunes',
    name: 'Singing Dunes',
    dayBadge: 'D6',
    dayNum: [6],
    lat: 43.8667,
    lon: 78.5667,
    color: '#F97316',
    type: 'roadtrip',
    highlight: 'Acoustic Sand Humming',
    desc: '45 km gravel track inside park. Climb the dune crest and slide down to hear organ-like humming.',
  },
  {
    id: 'aktau',
    name: 'Aktau Chalk Mountains',
    dayBadge: 'D7',
    dayNum: [7],
    lat: 44.0200,
    lon: 79.2500,
    color: '#A855F7',
    type: 'roadtrip',
    highlight: 'Martian White & Red Chalk Hills',
    desc: 'Alien-like colorful layered sedimentary canyon formations in remote Altyn-Emel desert.',
  },
  {
    id: 'qonaev',
    name: 'Qonaev / Kapchagay Highway',
    dayBadge: 'D7',
    dayNum: [7],
    lat: 43.8753,
    lon: 77.0758,
    color: '#6C63FF',
    type: 'roadtrip',
    highlight: 'Highway Return & Lake Fish Lunch',
    desc: 'Multi-lane A3 tollway passing Lake Kapchagay on return to Almaty & Arasan Baths.',
  },
  {
    id: 'bao',
    name: 'Big Almaty Lake (BAO)',
    dayBadge: 'D8',
    dayNum: [8],
    lat: 43.0506,
    lon: 76.9839,
    color: '#0EA5E9',
    type: 'excursion',
    highlight: 'Alpine Reservoir via Eco-Shuttle',
    desc: 'Final morning excursion via authorized shuttle before Rakhat Chocolate Factory & flight departure.',
  },
];

// Plan A Routes
const ROUTE_A_DAY2: [number, number][] = [
  [43.2389, 76.8897], [43.1575, 77.0592], [43.1281, 77.0811], [43.1575, 77.0592], [43.2389, 76.8897]
];
const ROUTE_A_DAY3: [number, number][] = [
  [43.2389, 76.8897], [43.1200, 76.9200], [43.0506, 76.9839], [43.1200, 76.9200], [43.2389, 76.8897]
];
const ROUTE_A_DAY4: [number, number][] = [
  [43.2389, 76.8897], [43.3500, 77.3500], [43.3500, 77.6200], [43.2260, 77.8710], [43.3500, 77.6200], [43.2389, 76.8897]
];
const ROUTE_A_DAY5: [number, number][] = [
  [43.2389, 76.8897], [43.5042, 78.5375], [43.4333, 78.6833], [43.3512, 79.0792], [43.2500, 78.9600], [43.1000, 78.6000], [42.9989, 78.4111]
];
const ROUTE_A_DAY6: [number, number][] = [
  [42.9989, 78.4111], [42.9847, 78.4656], [42.9989, 78.4111], [42.9833, 78.3242], [42.9989, 78.4111]
];
const ROUTE_A_DAY7: [number, number][] = [
  [42.9989, 78.4111], [43.1000, 78.6000], [43.4333, 78.6833], [43.5936, 78.2575], [43.9000, 78.6000], [44.1683, 78.7511], [43.8667, 78.5667], [44.1683, 78.7511]
];
const ROUTE_A_DAY8: [number, number][] = [
  [44.1683, 78.7511], [44.2000, 78.1000], [43.8753, 77.0758], [43.3500, 76.9500], [43.2389, 76.8897]
];

// Plan B Routes
const ROUTE_B_DAY2: [number, number][] = [
  [43.2389, 76.8897], [43.1575, 77.0592], [43.1281, 77.0811], [43.1575, 77.0592], [43.2389, 76.8897]
];
const ROUTE_B_DAY3: [number, number][] = [
  [43.2389, 76.8897], [43.3500, 77.3500], [43.2547, 77.4856], [43.3500, 77.6200], [43.5042, 78.5375], [43.5350, 79.4600]
];
const ROUTE_B_DAY4: [number, number][] = [
  [43.5350, 79.4600], [43.4333, 78.6833], [43.3512, 79.0792], [43.2500, 78.9600], [43.1000, 78.6000], [42.9989, 78.4111]
];
const ROUTE_B_DAY5: [number, number][] = [
  [42.9989, 78.4111], [42.9847, 78.4656], [42.9989, 78.4111], [42.9833, 78.3242], [42.9989, 78.4111]
];
const ROUTE_B_DAY6: [number, number][] = [
  [42.9989, 78.4111], [43.1000, 78.6000], [43.4333, 78.6833], [43.5936, 78.2575], [43.9000, 78.6000], [44.1683, 78.7511], [43.8667, 78.5667], [44.1683, 78.7511]
];
const ROUTE_B_DAY7: [number, number][] = [
  [44.1683, 78.7511], [44.0200, 79.2500], [44.1683, 78.7511], [43.8753, 77.0758], [43.2389, 76.8897]
];
const ROUTE_B_DAY8: [number, number][] = [
  [43.2389, 76.8897], [43.0506, 76.9839], [43.2389, 76.8897], [43.3500, 76.9500]
];

// Helper to create marker icon
function createMarkerIcon(stop: MapStop, isSelected: boolean) {
  const isBase = stop.type === 'base';
  const size = isSelected ? 36 : isBase ? 32 : 28;
  const pulseClass = isSelected ? 'box-shadow: 0 0 0 5px rgba(255,255,255,0.8), 0 6px 14px rgba(0,0,0,0.6);' : 'box-shadow: 0 4px 10px rgba(0,0,0,0.45);';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${stop.color};
        color: #ffffff;
        font-family: var(--font-display), sans-serif;
        font-weight: 800;
        font-size: ${size < 30 ? '10px' : '11px'};
        border-radius: ${isBase ? '10px' : '50%'};
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        ${pulseClass}
        transform: translate(-50%, -50%);
        transition: all 0.25s ease-out;
      ">
        ${stop.dayBadge}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
}

interface MapTabProps {
  isDarkMode: boolean;
  activePlan?: 'plan_a' | 'plan_b';
}

export default function MapTab({ isDarkMode, activePlan = 'plan_b' }: MapTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | number>('all');
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const stops = activePlan === 'plan_b' ? STOPS_PLAN_B : STOPS_PLAN_A;

  // Filter visible stops based on selected day
  const visibleStops = useMemo(() => {
    if (selectedFilter === 'all') return stops;
    return stops.filter(s => s.dayNum.includes(selectedFilter));
  }, [selectedFilter, stops]);

  // Compute bounding box for auto-zooming
  const mapBounds = useMemo(() => {
    if (visibleStops.length === 0) return undefined;
    return L.latLngBounds(visibleStops.map(s => [s.lat, s.lon]));
  }, [visibleStops]);

  const daysButtons: { id: 'all' | number; label: string; desc: string }[] = activePlan === 'plan_b' ? [
    { id: 'all', label: 'All 8 Days', desc: 'Autumn Road Trip Circuit' },
    { id: 1, label: 'Day 1', desc: 'Almaty Arrival & Culture' },
    { id: 2, label: 'Day 2', desc: 'Medeu, Shymbulak & Car' },
    { id: 3, label: 'Day 3', desc: 'Issyk, Turgen & Hot Springs' },
    { id: 4, label: 'Day 4', desc: 'Chundzha → Charyn → Saty' },
    { id: 5, label: 'Day 5', desc: 'Kaindy & Kolsai Lakes' },
    { id: 6, label: 'Day 6', desc: 'Saty → Altyn Emel Dunes' },
    { id: 7, label: 'Day 7', desc: 'Aktau Mountains → Arasan' },
    { id: 8, label: 'Day 8', desc: 'Big Almaty Lake & Airport' },
  ] : [
    { id: 'all', label: 'All 8 Days', desc: 'Full Kazakhstan Journey' },
    { id: 1, label: 'Day 1', desc: 'Almaty Arrival & Culture' },
    { id: 2, label: 'Day 2', desc: 'Medeu & Shymbulak 3200m' },
    { id: 3, label: 'Day 3', desc: 'Big Almaty Lake (BAO)' },
    { id: 4, label: 'Day 4', desc: 'Assy Plateau & Turgen' },
    { id: 5, label: 'Day 5', desc: 'Almaty → Charyn → Saty' },
    { id: 6, label: 'Day 6', desc: 'Kaindy & Kolsai Lakes' },
    { id: 7, label: 'Day 7', desc: 'Saty → Altyn Emel Dunes' },
    { id: 8, label: 'Day 8', desc: 'Basshi → Qonaev → Return' },
  ];

  const routeD2 = activePlan === 'plan_b' ? ROUTE_B_DAY2 : ROUTE_A_DAY2;
  const routeD3 = activePlan === 'plan_b' ? ROUTE_B_DAY3 : ROUTE_A_DAY3;
  const routeD4 = activePlan === 'plan_b' ? ROUTE_B_DAY4 : ROUTE_A_DAY4;
  const routeD5 = activePlan === 'plan_b' ? ROUTE_B_DAY5 : ROUTE_A_DAY5;
  const routeD6 = activePlan === 'plan_b' ? ROUTE_B_DAY6 : ROUTE_A_DAY6;
  const routeD7 = activePlan === 'plan_b' ? ROUTE_B_DAY7 : ROUTE_A_DAY7;
  const routeD8 = activePlan === 'plan_b' ? ROUTE_B_DAY8 : ROUTE_A_DAY8;

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* ── Day Filter Bar (Neumorphic Pills) ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1">
        {daysButtons.map(btn => {
          const isSelected = selectedFilter === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => {
                setSelectedFilter(btn.id);
                setActiveStopId(null);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all text-left ${
                isSelected
                  ? 'neu-inset-deep text-[var(--neu-accent)] font-bold ring-2 ring-[var(--neu-accent)]/50'
                  : 'neu-btn text-neu-muted hover:text-neu-text'
              }`}
            >
              <div className="font-display font-bold leading-tight">{btn.label}</div>
              <div className="text-[9px] opacity-75 font-normal truncate max-w-[130px]">{btn.desc}</div>
            </button>
          );
        })}
      </div>

      {/* ── Interactive Leaflet Map Container ── */}
      <div className="h-[540px] w-full flex flex-col rounded-[28px] overflow-hidden neu-inset p-1.5">
        <div className="flex-1 w-full rounded-[24px] overflow-hidden relative">
          <MapContainer
            center={[43.4, 77.8]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapViewController bounds={mapBounds} />

            <TileLayer
              className={isDarkMode ? 'dark-tiles' : ''}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Dynamic Polylines Based On Active Plan & Filter */}
            {(selectedFilter === 'all' || selectedFilter === 2) && (
              <Polyline
                positions={routeD2}
                pathOptions={{
                  color: '#06B6D4',
                  weight: selectedFilter === 2 ? 4.5 : 2.5,
                  dashArray: '6, 6',
                  opacity: selectedFilter === 2 ? 0.95 : 0.75,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 3) && (
              <Polyline
                positions={routeD3}
                pathOptions={{
                  color: '#0EA5E9',
                  weight: selectedFilter === 3 ? 4.5 : 2.5,
                  dashArray: activePlan === 'plan_b' ? undefined : '6, 6',
                  opacity: selectedFilter === 3 ? 0.95 : 0.75,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 4) && (
              <Polyline
                positions={routeD4}
                pathOptions={{
                  color: '#8B84FF',
                  weight: selectedFilter === 4 ? 4.5 : 2.5,
                  dashArray: activePlan === 'plan_b' ? undefined : '6, 6',
                  opacity: selectedFilter === 4 ? 0.95 : 0.75,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 5) && (
              <Polyline
                positions={routeD5}
                pathOptions={{
                  color: '#10B981',
                  weight: selectedFilter === 5 ? 4.5 : 3,
                  opacity: 0.9,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 6) && (
              <Polyline
                positions={routeD6}
                pathOptions={{
                  color: '#F97316',
                  weight: selectedFilter === 6 ? 4.5 : 3,
                  dashArray: '8, 6',
                  opacity: 0.9,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 7) && (
              <Polyline
                positions={routeD7}
                pathOptions={{
                  color: '#A855F7',
                  weight: selectedFilter === 7 ? 4.5 : 3,
                  opacity: 0.9,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 8) && (
              <Polyline
                positions={routeD8}
                pathOptions={{
                  color: '#6C63FF',
                  weight: selectedFilter === 8 ? 4.5 : 3,
                  opacity: 0.9,
                }}
              />
            )}

            {/* Markers */}
            {visibleStops.map(stop => {
              const isSelected = activeStopId === stop.id;
              return (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lon]}
                  icon={createMarkerIcon(stop, isSelected)}
                  eventHandlers={{
                    click: () => setActiveStopId(stop.id),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '220px', fontFamily: 'var(--font-body), sans-serif' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          style={{ background: stop.color }}
                          className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                        >
                          Day {stop.dayBadge}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{stop.highlight}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827', lineHeight: '1.2' }}>
                        {stop.name}
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.45', color: '#4B5563', marginTop: '4px' }}>
                        {stop.desc}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-xs font-medium bg-neu-card text-neu-muted neu-inset-sm mt-1 rounded-[20px]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-[4px] text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#6C63FF' }}>D1</span>
              <span>Almaty</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#06B6D4' }}>D2</span>
              <span>Medeu/Shymbulak</span>
            </div>
            {activePlan === 'plan_b' ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#EC4899' }}>D3</span>
                  <span>Chundzha Springs</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#F59E0B' }}>D4</span>
                  <span>Charyn & Saty</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#0EA5E9' }}>D3</span>
                  <span>Big Almaty Lake</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#8B84FF' }}>D4</span>
                  <span>Assy Plateau</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-[4px] text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#10B981' }}>D5</span>
              <span>Saty & Lakes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-[4px] text-[8px] font-extrabold text-white flex items-center justify-center" style={{ background: '#F97316' }}>D6</span>
              <span>Singing Dunes</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[var(--neu-accent)]">
            💡 Tap any day pill above to isolate that day&apos;s exact route
          </div>
        </div>
      </div>
    </div>
  );
}
