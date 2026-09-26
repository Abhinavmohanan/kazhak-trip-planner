'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Fix Leaflet's default icon path issue with webpack ────────────────────────
function FixLeafletIcons() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

// ── Trip stop definitions ─────────────────────────────────────────────────────
const STOPS = [
  { name: 'Almaty City', lat: 43.222, lon: 76.851, day: 'Days 1–4 & 8', color: '#6C63FF', desc: 'City base — hotel, Green Bazaar, Medeu, Shymbulak, Kok Tobe, Big Almaty Lake, Arasan Baths' },
  { name: 'Medeu & Shymbulak', lat: 43.157, lon: 77.006, day: 'Day 2', color: '#38B2AC', desc: 'Highest ice rink in the world + cable car to Talgar Pass (3200m)' },
  { name: 'Big Almaty Lake', lat: 43.058, lon: 76.987, day: 'Day 3', color: '#38B2AC', desc: 'Turquoise alpine reservoir — bring passports (border patrol zone)' },
  { name: 'Assy Plateau', lat: 43.408, lon: 77.75, day: 'Day 4', color: '#8B84FF', desc: 'High-altitude steppe (2700m), Soviet observatory, nomadic yurts, wild horses' },
  { name: 'Charyn Canyon', lat: 43.35, lon: 79.067, day: 'Day 5', color: '#D97706', desc: 'Valley of Castles — dramatic red rock gorge, 2.5 km hike to Charyn River' },
  { name: 'Black Canyon', lat: 43.312, lon: 79.184, day: 'Day 5', color: '#D97706', desc: 'Short photo stop — sheer vertical cliff view from highway overlook' },
  { name: 'Saty Village', lat: 42.917, lon: 78.317, day: 'Days 5–6', color: '#2DD4BF', desc: 'Family guesthouse base — cash only! Gateway to Kaindy & Kolsai' },
  { name: 'Lake Kaindy', lat: 42.983, lon: 78.45, day: 'Day 6', color: '#2DD4BF', desc: 'Submerged birch forest in turquoise water — take local UAZ van, NOT rental car' },
  { name: 'Lower Kolsai Lake', lat: 42.992, lon: 78.327, day: 'Day 6', color: '#2DD4BF', desc: 'Rowboat on stunning alpine lake (~5000 KZT / 30 mins)' },
  { name: 'Basshi / Altyn Emel', lat: 44.083, lon: 78.383, day: 'Day 7', color: '#F59E0B', desc: 'National Park HQ — permit required. Singing Dunes 45 km inside park' },
  { name: 'Singing Dunes', lat: 43.967, lon: 78.7, day: 'Day 7', color: '#F59E0B', desc: 'Famous dunes that produce an organ-like hum when wind blows across — climb the ridge!' },
];

const ROAD_TRIP_ROUTE: [number, number][] = [
  [43.222, 76.851], // Almaty
  [43.35, 79.067],  // Charyn
  [42.917, 78.317], // Saty
  [42.983, 78.45],  // Kaindy
  [42.917, 78.317], // Back to Saty
  [44.083, 78.383], // Basshi
  [43.967, 78.7],   // Singing Dunes
  [44.083, 78.383], // Back to Basshi
  [43.222, 76.851], // Return to Almaty
];

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 16px; height: 16px;
      background: ${color};
      border: 3px solid rgba(255,255,255,0.9);
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

interface MapTabProps {
  isDarkMode: boolean;
}

export default function MapTab({ isDarkMode }: MapTabProps) {
  return (
    <div className="h-[520px] w-full flex flex-col rounded-[28px] overflow-hidden">
      <div className="flex-1 w-full relative">
        <MapContainer
          center={[43.3, 77.8]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <FixLeafletIcons />

          <TileLayer
            className={isDarkMode ? 'dark-tiles' : ''}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <Polyline
            positions={ROAD_TRIP_ROUTE}
            pathOptions={{ color: isDarkMode ? '#8B84FF' : '#6C63FF', weight: 3, dashArray: '6, 6', opacity: 0.85 }}
          />

          {STOPS.map((stop) => (
            <Marker
              key={stop.name}
              position={[stop.lat, stop.lon]}
              icon={makeIcon(stop.color)}
            >
              <Popup>
                <div style={{ minWidth: '200px', fontFamily: 'var(--font-body), sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: stop.color }}>{stop.name}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>{stop.day}</div>
                  <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#374151' }}>{stop.desc}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Neumorphic Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 text-xs font-medium bg-neu-card text-neu-muted neu-inset-sm">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ background: '#6C63FF' }} />Almaty (City Base)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ background: '#38B2AC' }} />Day Trips from Almaty</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ background: '#D97706' }} />Charyn Canyon</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ background: '#2DD4BF' }} />Saty / Lakes</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ background: '#F59E0B' }} />Altyn Emel</div>
        <div className="flex items-center gap-1.5"><span className="border-b-2 border-dashed inline-block w-6" style={{ borderColor: isDarkMode ? '#8B84FF' : '#6C63FF' }} />Road Trip Route</div>
      </div>
    </div>
  );
}
