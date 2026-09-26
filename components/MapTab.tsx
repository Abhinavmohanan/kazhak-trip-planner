'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Fix Leaflet's default icon path issue with webpack ────────────────────────
// (Leaflet tries to load marker images from its own package path which breaks in Next.js)
function FixLeafletIcons() {
  const map = useMap();
  useEffect(() => {
    // Force a resize in case container was hidden
    map.invalidateSize();
  }, [map]);
  return null;
}

// ── Trip stop definitions ─────────────────────────────────────────────────────
const STOPS = [
  { name: 'Almaty City', lat: 43.222, lon: 76.851, day: 'Days 1–4 & 8', color: '#10b981', desc: 'City base — hotel, Green Bazaar, Medeu, Shymbulak, Kok Tobe, Big Almaty Lake, Arasan Baths' },
  { name: 'Medeu & Shymbulak', lat: 43.157, lon: 77.006, day: 'Day 2', color: '#06b6d4', desc: 'Highest ice rink in the world + cable car to Talgar Pass (3200m)' },
  { name: 'Big Almaty Lake', lat: 43.058, lon: 76.987, day: 'Day 3', color: '#06b6d4', desc: 'Turquoise alpine reservoir — bring passports (border patrol zone)' },
  { name: 'Assy Plateau', lat: 43.408, lon: 77.75, day: 'Day 4', color: '#a78bfa', desc: 'High-altitude steppe (2700m), Soviet observatory, nomadic yurts, wild horses' },
  { name: 'Charyn Canyon', lat: 43.35, lon: 79.067, day: 'Day 5', color: '#f59e0b', desc: 'Valley of Castles — dramatic red rock gorge, 2.5 km hike to Charyn River' },
  { name: 'Black Canyon', lat: 43.312, lon: 79.184, day: 'Day 5', color: '#f59e0b', desc: 'Short photo stop — sheer vertical cliff view from highway overlook' },
  { name: 'Saty Village', lat: 42.917, lon: 78.317, day: 'Days 5–6', color: '#34d399', desc: 'Family guesthouse base — cash only! Gateway to Kaindy & Kolsai' },
  { name: 'Lake Kaindy', lat: 42.983, lon: 78.45, day: 'Day 6', color: '#34d399', desc: 'Submerged birch forest in turquoise water — take local UAZ van, NOT rental car' },
  { name: 'Lower Kolsai Lake', lat: 42.992, lon: 78.327, day: 'Day 6', color: '#34d399', desc: 'Rowboat on stunning alpine lake (~5000 KZT / 30 mins)' },
  { name: 'Basshi / Altyn Emel', lat: 44.083, lon: 78.383, day: 'Day 7', color: '#fb923c', desc: 'National Park HQ — permit required. Singing Dunes 45 km inside park' },
  { name: 'Singing Dunes', lat: 43.967, lon: 78.7, day: 'Day 7', color: '#fb923c', desc: 'Famous dunes that produce an organ-like hum when wind blows across — climb the ridge!' },
];

// Route polyline for the road trip (Days 5–8)
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

// Build colored divIcon for each stop
function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

interface MapTabProps {
  isDarkMode: boolean;
}

export default function MapTab({ isDarkMode }: MapTabProps) {
  return (
    <div style={{ height: '520px', width: '100%' }}>
      <MapContainer
        center={[43.3, 77.8]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <FixLeafletIcons />

        {/* Tile layer — use CartoDB dark for dark mode, light otherwise */}
        {isDarkMode ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}

        {/* Road trip route line */}
        <Polyline
          positions={ROAD_TRIP_ROUTE}
          pathOptions={{ color: '#10b981', weight: 2.5, dashArray: '6, 6', opacity: 0.8 }}
        />

        {/* Location markers */}
        {STOPS.map((stop) => (
          <Marker
            key={stop.name}
            position={[stop.lat, stop.lon]}
            icon={makeIcon(stop.color)}
          >
            <Popup>
              <div style={{ minWidth: '200px', fontFamily: 'sans-serif' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: stop.color }}>{stop.name}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{stop.day}</div>
                <div style={{ fontSize: '11px', lineHeight: '1.5' }}>{stop.desc}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className={`flex flex-wrap gap-4 p-3 text-xs border-t ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#10b981' }} />Almaty (City Base)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#06b6d4' }} />Day Trips from Almaty</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#f59e0b' }} />Charyn Canyon</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#34d399' }} />Saty / Lakes</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#fb923c' }} />Altyn Emel</div>
        <div className="flex items-center gap-1.5"><span className="border-b-2 border-dashed inline-block w-6" style={{ borderColor: '#10b981' }} />Road Trip Route</div>
      </div>
    </div>
  );
}
