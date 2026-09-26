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

const ALL_STOPS: MapStop[] = [
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

// ── Realistic Road Route Polylines By Day ─────────────────────────────────────
// Excursions from Almaty
const ROUTE_DAY2: [number, number][] = [
  [43.2389, 76.8897], // Almaty
  [43.1575, 77.0592], // Medeu
  [43.1281, 77.0811], // Shymbulak
  [43.1575, 77.0592], // Medeu
  [43.2389, 76.8897], // Almaty
];

const ROUTE_DAY3: [number, number][] = [
  [43.2389, 76.8897], // Almaty
  [43.1200, 76.9200], // Almarasan Gorge
  [43.0506, 76.9839], // Big Almaty Lake
  [43.1200, 76.9200], // Return
  [43.2389, 76.8897], // Almaty
];

const ROUTE_DAY4: [number, number][] = [
  [43.2389, 76.8897], // Almaty
  [43.3500, 77.3500], // Talgar / Issyk road
  [43.3500, 77.6200], // Turgen Gorge
  [43.2260, 77.8710], // Assy Plateau & Observatory
  [43.3500, 77.6200], // Return via Turgen
  [43.2389, 76.8897], // Almaty
];

// Grand Road Trip Loop (Days 5 to 8)
const ROUTE_DAY5: [number, number][] = [
  [43.2389, 76.8897], // Almaty
  [43.5042, 78.5375], // Baiseit Village (A3 highway)
  [43.4333, 78.6833], // Kokpek junction
  [43.3512, 79.0792], // Charyn Canyon
  [43.2500, 78.9600], // Black Canyon
  [43.1000, 78.6000], // Mountain road south
  [42.9989, 78.4111], // Saty Village
];

const ROUTE_DAY6: [number, number][] = [
  [42.9989, 78.4111], // Saty
  [42.9847, 78.4656], // Lake Kaindy (4x4 track)
  [42.9989, 78.4111], // Saty lunch
  [42.9833, 78.3242], // Lower Kolsai Lake
  [42.9989, 78.4111], // Saty Guesthouse
];

const ROUTE_DAY7: [number, number][] = [
  [42.9989, 78.4111], // Saty
  [43.1000, 78.6000], // North towards Kokpek
  [43.4333, 78.6833], // Kokpek pass
  [43.5936, 78.2575], // Shelek / Chilik corridor around mountains
  [43.9000, 78.6000], // North-east towards Altyn Emel
  [44.1683, 78.7511], // Basshi HQ
  [43.8667, 78.5667], // Singing Dunes inside park
  [44.1683, 78.7511], // Basshi Guesthouse
];

const ROUTE_DAY8: [number, number][] = [
  [44.1683, 78.7511], // Basshi
  [44.2000, 78.1000], // West along highway
  [43.8753, 77.0758], // Qonaev / Kapchagay Reservoir
  [43.3500, 76.9500], // Almaty Airport ALA
  [43.2389, 76.8897], // Almaty City Center
];

// Complete Grand Circuit Loop
const FULL_ROAD_TRIP_CIRCUIT: [number, number][] = [
  ...ROUTE_DAY5,
  ...ROUTE_DAY6,
  ...ROUTE_DAY7,
  ...ROUTE_DAY8,
];

// Helper to create high-contrast custom numbered marker icons
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
}

export default function MapTab({ isDarkMode }: MapTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | number>('all');
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  // Filter visible stops based on selected day
  const visibleStops = useMemo(() => {
    if (selectedFilter === 'all') return ALL_STOPS;
    return ALL_STOPS.filter(s => s.dayNum.includes(selectedFilter));
  }, [selectedFilter]);

  // Compute bounding box for auto-zooming
  const mapBounds = useMemo(() => {
    if (visibleStops.length === 0) return undefined;
    return L.latLngBounds(visibleStops.map(s => [s.lat, s.lon]));
  }, [visibleStops]);

  const daysButtons: { id: 'all' | number; label: string; desc: string }[] = [
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
              <div className="text-[9px] opacity-75 font-normal truncate max-w-[120px]">{btn.desc}</div>
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

            {/* Standard OpenStreetMap with CSS dark filter (100% free, zero watermark) */}
            <TileLayer
              className={isDarkMode ? 'dark-tiles' : ''}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* ── Dynamic Polylines Based On Filter ── */}
            {/* 1. Day Excursions from Almaty (Dotted/Dashed lines radiating to mountains) */}
            {(selectedFilter === 'all' || selectedFilter === 2) && (
              <Polyline
                positions={ROUTE_DAY2}
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
                positions={ROUTE_DAY3}
                pathOptions={{
                  color: '#0EA5E9',
                  weight: selectedFilter === 3 ? 4.5 : 2.5,
                  dashArray: '6, 6',
                  opacity: selectedFilter === 3 ? 0.95 : 0.75,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 4) && (
              <Polyline
                positions={ROUTE_DAY4}
                pathOptions={{
                  color: '#8B84FF',
                  weight: selectedFilter === 4 ? 4.5 : 2.5,
                  dashArray: '6, 6',
                  opacity: selectedFilter === 4 ? 0.95 : 0.75,
                }}
              />
            )}

            {/* 2. Days 5 to 8 Grand Road Trip Segments */}
            {(selectedFilter === 'all' || selectedFilter === 5) && (
              <Polyline
                positions={ROUTE_DAY5}
                pathOptions={{
                  color: '#F59E0B',
                  weight: selectedFilter === 5 ? 4.5 : 3,
                  opacity: 0.9,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 6) && (
              <Polyline
                positions={ROUTE_DAY6}
                pathOptions={{
                  color: '#10B981',
                  weight: selectedFilter === 6 ? 4.5 : 3,
                  dashArray: '8, 6',
                  opacity: 0.9,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 7) && (
              <Polyline
                positions={ROUTE_DAY7}
                pathOptions={{
                  color: '#F97316',
                  weight: selectedFilter === 7 ? 4.5 : 3,
                  opacity: 0.9,
                }}
              />
            )}

            {(selectedFilter === 'all' || selectedFilter === 8) && (
              <Polyline
                positions={ROUTE_DAY8}
                pathOptions={{
                  color: '#6C63FF',
                  weight: selectedFilter === 8 ? 4.5 : 3,
                  opacity: 0.9,
                }}
              />
            )}

            {/* ── Numbered Markers with Popups ── */}
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

        {/* ── Clear Visual Legend ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-xs font-medium bg-neu-card text-neu-muted neu-inset-sm mt-1 rounded-[20px]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-[6px] text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#6C63FF' }}>D1</span>
              <span>Almaty Base (Days 1–4, 8)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#06B6D4' }}>D2</span>
              <span>Medeu / Shymbulak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#0EA5E9' }}>D3</span>
              <span>Big Almaty Lake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#8B84FF' }}>D4</span>
              <span>Assy Plateau</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#F59E0B' }}>D5</span>
              <span>Charyn Canyon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-[6px] text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#10B981' }}>D5-6</span>
              <span>Saty & Lakes (Kaindy / Kolsai)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-[6px] text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm" style={{ background: '#F97316' }}>D7</span>
              <span>Altyn Emel & Singing Dunes</span>
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
