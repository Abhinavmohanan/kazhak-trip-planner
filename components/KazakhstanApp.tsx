'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ActivityEditModal from './ActivityEditModal';
import DayEditModal from './DayEditModal';
import planAJson from '@/data/itinerary.json';
import planBJson from '@/data/itinerary_plan_b.json';
import {
  Calendar, MapPin, Compass, Car, Luggage, DollarSign, BookOpen,
  CheckSquare, Volume2, ShieldAlert, PhoneCall,
  Sun, Moon, AlertTriangle, Navigation, Clock,
  Users, Check, RefreshCw, Calculator, Coffee,
  Printer, Wind, Thermometer, Droplets, Map, Timer,
  ChevronDown, ChevronUp, Zap, MoreHorizontal, X,
  Edit3, Plus, RotateCcw, GripVertical, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';

const MapTab = dynamic(() => import('./MapTab'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Activity {
  time: string;
  place: string;
  whatToDo: string;
  mustTry: string;
  lookOutFor: string;
  kztExpense: number;
  category: 'sightseeing' | 'food' | 'transit' | 'hotel';
}

export interface DayData {
  day: number;
  date: string;
  title: string;
  overnight: string;
  location: string;
  activities: Activity[];
}

interface WeatherData {
  location: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  loading: boolean;
  error?: string;
}

interface PackingItem {
  id: number;
  text: string;
  checked: boolean;
  category: string;
}

// ─── Master Default Itineraries ───────────────────────────────────────────────
const DEFAULT_PLAN_A_DATA: DayData[] = planAJson as DayData[];
const DEFAULT_PLAN_B_DATA: DayData[] = planBJson as DayData[];
const DEFAULT_ITINERARY_DATA: DayData[] = DEFAULT_PLAN_B_DATA;

const PHRASES = [
  { cat: 'Greetings', ru: 'Здравствуйте', trans: 'Zdrav-stvuy-te', mean: 'Hello (Formal)' },
  { cat: 'Greetings', ru: 'Спасибо', trans: 'Spas-ee-ba / Rakh-met', mean: 'Thank you' },
  { cat: 'Greetings', ru: 'Да / Нет', trans: 'Da / Nyet', mean: 'Yes / No' },
  { cat: 'Greetings', ru: 'Пожалуйста', trans: 'Pa-zhal-oo-sta', mean: 'Please / You\'re welcome' },
  { cat: 'Taxi', ru: 'Сколько стоит до...?', trans: 'Skol-ko sto-it do...?', mean: 'How much to go to...?' },
  { cat: 'Taxi', ru: 'Остановите здесь', trans: 'Osta-nov-i-te zdes', mean: 'Stop here please' },
  { cat: 'Taxi', ru: 'Направо / Налево', trans: 'Na-pra-vo / Na-le-vo', mean: 'Right / Left' },
  { cat: 'Taxi', ru: 'Где находится...?', trans: 'Gde na-kho-dit-sya...?', mean: 'Where is...?' },
  { cat: 'Shopping', ru: 'Сколько это стоит?', trans: 'Skol-ko e-to sto-it?', mean: 'How much is this?' },
  { cat: 'Shopping', ru: 'Можно карту / наличные?', trans: 'Mozh-no kar-too / na-lich-ny-e?', mean: 'Card or Cash?' },
  { cat: 'Shopping', ru: 'Чек, пожалуйста', trans: 'Chek pa-zhal-oo-sta', mean: 'Bill/Receipt please' },
  { cat: 'Shopping', ru: 'Без мяса / Свинины', trans: 'Bez mya-sa / Svi-ni-ny', mean: 'No meat / No pork' },
  { cat: 'Emergency', ru: 'Помогите!', trans: 'Po-mo-gi-te!', mean: 'Help me!' },
  { cat: 'Emergency', ru: 'Где туалет?', trans: 'Gde too-a-let?', mean: 'Where is the bathroom?' },
  { cat: 'Emergency', ru: 'Вы говорите по-английски?', trans: 'Vy go-vo-ri-te po ang-liys-ki?', mean: 'Do you speak English?' },
  { cat: 'Emergency', ru: 'Мне нужен врач', trans: 'Mne noo-zhen vrach', mean: 'I need a doctor' },
];

const ROUTE_LEGS_PLAN_A = [
  { from: 'Almaty', to: 'Medeu Rink', dist: '18 km', time: '35-45 min', road: 'Paved (Bus 12 / Yandex)' },
  { from: 'Almaty', to: 'Big Almaty Lake', dist: '28 km', time: '1 hr + 1.5 hr hike', road: 'Paved to barrier, then walk' },
  { from: 'Almaty', to: 'Assy Plateau', dist: '100 km', time: '3.5–4 hrs', road: 'Paved → steep 4x4 track' },
  { from: 'Almaty', to: 'Charyn Canyon', dist: '200 km', time: '3.5–4 hrs', road: 'Paved A3 + 10 km gravel' },
  { from: 'Charyn Canyon', to: 'Saty Village', dist: '85 km', time: '1.5 hrs', road: 'Paved regional road' },
  { from: 'Saty', to: 'Lake Kaindy', dist: '15 km', time: '45 min', road: '⚠️ Extreme riverbed — use UAZ van!' },
  { from: 'Saty', to: 'Lower Kolsai', dist: '15 km', time: '20 min', road: 'Smooth paved asphalt' },
  { from: 'Saty', to: 'Basshi (Altyn Emel)', dist: '250 km', time: '4.5 hrs', road: 'Paved via Chilik & Kokpek pass' },
  { from: 'Basshi', to: 'Singing Dunes', dist: '90 km RT', time: '2 hrs total', road: 'Washboard gravel (max 40 km/h)' },
  { from: 'Basshi', to: 'Almaty', dist: '255 km', time: '3.5–4 hrs', road: 'Paved A3 via Qonaev tollroad' },
];

const ROUTE_LEGS_PLAN_B = [
  { from: 'Almaty', to: 'Medeu Rink', dist: '18 km', time: '35-45 min', road: 'Paved (Bus 12 / Yandex)' },
  { from: 'Almaty', to: 'Issyk Lake', dist: '80 km', time: '1.5 hrs', road: 'Paved scenic foothill road' },
  { from: 'Issyk Lake', to: 'Turgen Gorge', dist: '45 km', time: '1 hr', road: 'Paved mountain gorge road' },
  { from: 'Turgen Gorge', to: 'Chundzha Hot Springs', dist: '165 km', time: '2.5 hrs', road: 'Kulja tract highway (A351)' },
  { from: 'Chundzha', to: 'Charyn Canyon', dist: '85 km', time: '1 hr 15 min', road: 'Paved steppe highway + 10 km gravel' },
  { from: 'Charyn Canyon', to: 'Black Canyon', dist: '25 km', time: '25 min', road: 'Paved regional highway' },
  { from: 'Black Canyon', to: 'Saty Village', dist: '60 km', time: '1 hr', road: 'Paved mountain scenic road' },
  { from: 'Saty', to: 'Lake Kaindy', dist: '15 km', time: '45 min', road: '⚠️ Extreme riverbed — use UAZ van!' },
  { from: 'Saty', to: 'Lower Kolsai', dist: '15 km', time: '20 min', road: 'Smooth paved asphalt' },
  { from: 'Saty', to: 'Basshi (Altyn Emel)', dist: '250 km', time: '4.5 hrs', road: 'Paved via Chilik & Kokpek pass' },
  { from: 'Basshi', to: 'Singing Dunes', dist: '90 km RT', time: '2 hrs total', road: 'Washboard gravel (max 40 km/h)' },
  { from: 'Basshi', to: 'Aktau Chalk Mountains', dist: '90 km RT', time: '3 hrs total', road: 'Washboard gravel / clay track' },
  { from: 'Basshi', to: 'Almaty (via Qonaev)', dist: '255 km', time: '3.5–4 hrs', road: 'Paved A3 tollroad' },
  { from: 'Almaty', to: 'Big Almaty Lake (BAO)', dist: '28 km', time: '1 hr', road: 'Authorized eco-shuttle only' },
];

const WEATHER_LOCATIONS = [
  { name: 'Almaty', lat: 43.222, lon: 76.8512, desc: 'City base' },
  { name: 'Charyn Canyon', lat: 43.35, lon: 79.067, desc: 'Day 5 canyon' },
  { name: 'Saty / Kolsai', lat: 42.917, lon: 78.317, desc: 'Days 5–6 alpine' },
  { name: 'Altyn Emel', lat: 44.083, lon: 78.383, desc: 'Day 7 steppe' },
];

const EXCHANGE_RATES: Record<string, number> = {
  INR: 0.175, USD: 0.0021, EUR: 0.0019, GBP: 0.00165,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£',
};

const DEPARTURE = new Date('2026-10-11T09:50:00+06:00');
const TRIP_END   = new Date('2026-10-18T23:59:00+06:00');
const CATEGORY_EMOJI: Record<string, string> = {
  sightseeing: '🏔️', food: '🍽️', transit: '🚗', hotel: '🏠',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function weatherCodeInfo(code: number) {
  if (code === 0) return { emoji: '☀️', label: 'Clear' };
  if (code <= 2)  return { emoji: '🌤️', label: 'Partly Cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Overcast' };
  if (code <= 48) return { emoji: '🌫️', label: 'Foggy' };
  if (code <= 55) return { emoji: '🌦️', label: 'Drizzle' };
  if (code <= 65) return { emoji: '🌧️', label: 'Rain' };
  if (code <= 77) return { emoji: '🌨️', label: 'Snow' };
  if (code <= 82) return { emoji: '🌧️', label: 'Showers' };
  return { emoji: '⛈️', label: 'Thunderstorm' };
}

function parseTimeRange(timeStr: string): { start: number; end: number } | null {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return {
    start: parseInt(m[1]) * 60 + parseInt(m[2]),
    end:   parseInt(m[3]) * 60 + parseInt(m[4]),
  };
}

function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

// ─── Static Packing Data ──────────────────────────────────────────────────────
const PACKING_ITEMS_DATA: Omit<PackingItem, 'checked'>[] = [
  { id: 1,  text: 'Original Passports (MANDATORY for Big Almaty Lake border check)', category: 'Docs'     },
  { id: 2,  text: 'International Driving Permit (IDP) + License',                    category: 'Docs'     },
  { id: 3,  text: 'Cash KZT (~150,000–200,000 KZT for Saty/Basshi)',                 category: 'Money'    },
  { id: 4,  text: 'Powerbank (10,000–20,000 mAh)',                                   category: 'Tech'     },
  { id: 5,  text: 'Thermal Layers & Windbreaker (Assy & Shymbulak 0°C)',             category: 'Clothing' },
  { id: 6,  text: 'Soft Duffel Bags (1 per person — no hard suitcases)',             category: 'Luggage'  },
  { id: 7,  text: 'Offline Maps: 2GIS & Yandex Maps downloaded',                     category: 'Tech'     },
  { id: 8,  text: '2L Water bottle per person + Dry Snacks/Nuts',                    category: 'Food'     },
  { id: 9,  text: 'Rubber slippers & small towel (Arasan Baths)',                    category: 'Personal' },
  { id: 10, text: 'Sunscreen SPF50 & Sunglasses (Charyn & Dunes)',                   category: 'Personal' },
  { id: 11, text: 'First Aid Kit + altitude sickness tablets',                        category: 'Health'   },
  { id: 12, text: 'Travel Insurance documents (print + digital)',                     category: 'Docs'     },
];
const DEFAULT_CHECKED_IDS = [1, 2, 6];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KazakhstanApp() {
  // ── Dynamic Itinerary State (Dual Plan Support + LocalStorage Cached) ─────────
  const [activePlanId, setActivePlanId] = useLocalStorage<'plan_a' | 'plan_b'>('kz-active-plan', 'plan_b');
  const [planAItinerary, setPlanAItinerary] = useLocalStorage<DayData[]>('kz-itinerary-plan-a', DEFAULT_PLAN_A_DATA);
  const [planBItinerary, setPlanBItinerary] = useLocalStorage<DayData[]>('kz-itinerary-plan-b', DEFAULT_PLAN_B_DATA);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'offline'>('idle');

  // Currently active plan's live itinerary
  const itinerary = activePlanId === 'plan_b' ? planBItinerary : planAItinerary;
  const setItinerary = useCallback((updater: DayData[] | ((prev: DayData[]) => DayData[])) => {
    if (activePlanId === 'plan_b') {
      setPlanBItinerary(updater);
    } else {
      setPlanAItinerary(updater);
    }
  }, [activePlanId, setPlanAItinerary, setPlanBItinerary]);

  // ── Persisted User Preferences (localStorage) ────────────────────────────────
  const [isDarkMode,       setIsDarkMode]       = useLocalStorage<boolean>('kz-dark-mode',      true);
  const [activeTab,        setActiveTab]        = useLocalStorage<string>('kz-active-tab',       'itinerary');
  const [categoryFilter,   setCategoryFilter]   = useLocalStorage<string>('kz-category-filter', 'all');
  const [phraseFilter,     setPhraseFilter]     = useLocalStorage<string>('kz-phrase-filter',   'all');
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage<string>('kz-currency',        'INR');
  const [strategyType,     setStrategyType]     = useLocalStorage<string>('kz-strategy',        'minivan');
  const [kztAmount,        setKztAmount]        = useLocalStorage<number>('kz-kzt-amount',      100000);
  const [checkedIds,       setCheckedIds]       = useLocalStorage<number[]>('kz-checklist',     DEFAULT_CHECKED_IDS);

  // ── Ephemeral UI State ───────────────────────────────────────────────────────
  const [selectedDay,       setSelectedDay]       = useState(1);
  const [expandedActivity,  setExpandedActivity]  = useState<number | null>(null);
  const [showEmergency,     setShowEmergency]     = useState(false);
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const [isDayEditOpen,     setIsDayEditOpen]     = useState(false);
  const [draggedIdx,        setDraggedIdx]        = useState<number | null>(null);
  const [dragOverIdx,       setDragOverIdx]       = useState<number | null>(null);

  // ── Edit Modal State ─────────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    activity: Activity;
    dayNumber: number;
    activityIndex?: number;
    isNew?: boolean;
  }>({
    isOpen: false,
    activity: {
      time: '09:00 - 11:00',
      place: '',
      whatToDo: '',
      mustTry: '',
      lookOutFor: '',
      kztExpense: 0,
      category: 'sightseeing',
    },
    dayNumber: 1,
    isNew: false,
  });

  // Fetch shared itineraries from backend on initial mount
  useEffect(() => {
    async function loadBackendItinerary() {
      try {
        const [resA, resB] = await Promise.all([
          fetch('/api/itinerary?plan=plan_a'),
          fetch('/api/itinerary?plan=plan_b'),
        ]);
        if (resA.ok) {
          const jsonA = await resA.json();
          if (jsonA.data && Array.isArray(jsonA.data) && jsonA.data.length > 0) {
            setPlanAItinerary(jsonA.data);
          }
        }
        if (resB.ok) {
          const jsonB = await resB.json();
          if (jsonB.data && Array.isArray(jsonB.data) && jsonB.data.length > 0) {
            setPlanBItinerary(jsonB.data);
          }
        }
        setSyncStatus('synced');
      } catch {
        setSyncStatus('offline');
      }
    }
    loadBackendItinerary();
  }, [setPlanAItinerary, setPlanBItinerary]);

  // Save changes to backend + localStorage
  const persistItinerary = useCallback(async (updated: DayData[]) => {
    setItinerary(updated);
    setSyncStatus('saving');
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: updated, plan: activePlanId }),
      });
      if (res.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    }
  }, [activePlanId, setItinerary]);

  // Reset to original master plan
  const handleResetItinerary = useCallback(async () => {
    const isPlanB = activePlanId === 'plan_b';
    const planName = isPlanB ? 'Plan B (Thermal Springs & Autumn Loop)' : 'Plan A (Classical Loop)';
    if (!confirm(`Reset all 8 days of ${planName} back to the original master itinerary? Any edits on this plan will be restored.`)) {
      return;
    }
    setSyncStatus('saving');
    try {
      const res = await fetch(`/api/itinerary?plan=${activePlanId}`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        const fallback = isPlanB ? DEFAULT_PLAN_B_DATA : DEFAULT_PLAN_A_DATA;
        setItinerary(json.data || fallback);
        setSyncStatus('synced');
      } else {
        setItinerary(isPlanB ? DEFAULT_PLAN_B_DATA : DEFAULT_PLAN_A_DATA);
        setSyncStatus('synced');
      }
    } catch {
      setItinerary(isPlanB ? DEFAULT_PLAN_B_DATA : DEFAULT_PLAN_A_DATA);
      setSyncStatus('synced');
    }
  }, [activePlanId, setItinerary]);

  // Open edit modal for existing activity
  const openEditModal = (dayNum: number, act: Activity, actIdx: number) => {
    setEditModal({
      isOpen: true,
      activity: { ...act },
      dayNumber: dayNum,
      activityIndex: actIdx,
      isNew: false,
    });
  };

  // Open modal to add a new activity
  const openAddModal = (dayNum: number) => {
    setEditModal({
      isOpen: true,
      activity: {
        time: '12:00 - 13:30',
        place: '',
        whatToDo: '',
        mustTry: '',
        lookOutFor: '',
        kztExpense: 0,
        category: 'sightseeing',
      },
      dayNumber: dayNum,
      isNew: true,
    });
  };

  // Save activity from modal
  const handleSaveActivity = (savedAct: Activity, actIdx?: number) => {
    const dayIdx = itinerary.findIndex(d => d.day === editModal.dayNumber);
    if (dayIdx === -1) return;

    const updated = [...itinerary];
    const currentDay = { ...updated[dayIdx] };
    const currentActs = [...currentDay.activities];

    if (actIdx !== undefined && !editModal.isNew) {
      currentActs[actIdx] = savedAct;
    } else {
      currentActs.push(savedAct);
    }

    currentDay.activities = currentActs;
    updated[dayIdx] = currentDay;
    persistItinerary(updated);
    setEditModal(prev => ({ ...prev, isOpen: false }));
  };

  // Delete activity from modal
  const handleDeleteActivity = (actIdx: number) => {
    const dayIdx = itinerary.findIndex(d => d.day === editModal.dayNumber);
    if (dayIdx === -1) return;

    const updated = [...itinerary];
    const currentDay = { ...updated[dayIdx] };
    currentDay.activities = currentDay.activities.filter((_, i) => i !== actIdx);
    updated[dayIdx] = currentDay;
    persistItinerary(updated);
    setEditModal(prev => ({ ...prev, isOpen: false }));
  };

  // Save day overview (Title, Location, Overnight stay)
  const handleSaveDay = (updatedFields: Partial<DayData>) => {
    const dayIdx = itinerary.findIndex(d => d.day === currentDayData.day);
    if (dayIdx === -1) return;

    const updated = [...itinerary];
    updated[dayIdx] = { ...updated[dayIdx], ...updatedFields };
    persistItinerary(updated);
    setIsDayEditOpen(false);
  };

  // Move / shuffle activity within the current day
  const handleMoveActivity = (dayNum: number, fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const dayIdx = itinerary.findIndex(d => d.day === dayNum);
    if (dayIdx === -1) return;

    const updated = [...itinerary];
    const currentDay = { ...updated[dayIdx] };
    const activities = [...currentDay.activities];

    if (fromIdx >= activities.length || toIdx >= activities.length) return;

    const [moved] = activities.splice(fromIdx, 1);
    activities.splice(toIdx, 0, moved);

    currentDay.activities = activities;
    updated[dayIdx] = currentDay;
    persistItinerary(updated);
  };

  // Sync dark class on HTML root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Derive packing items
  const packingItems: PackingItem[] = useMemo(() => PACKING_ITEMS_DATA.map(item => ({
    ...item,
    checked: checkedIds.includes(item.id),
  })), [checkedIds]);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, departed: false, tripOver: false });
  const [weatherData, setWeatherData] = useState<WeatherData[]>(
    WEATHER_LOCATIONS.map(l => ({ location: l.name, temp: 0, tempMin: 0, tempMax: 0, windSpeed: 0, humidity: 0, weatherCode: 0, loading: true }))
  );

  // Auto-detect trip day
  useEffect(() => {
    const now = new Date();
    const isOnTrip = now >= DEPARTURE && now <= TRIP_END;
    if (isOnTrip) {
      const dayNum = Math.floor((now.getTime() - new Date('2026-10-11T00:00:00+06:00').getTime()) / 86400000) + 1;
      if (dayNum >= 1 && dayNum <= 8) setSelectedDay(dayNum);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (now > TRIP_END) { setCountdown(c => ({ ...c, tripOver: true, departed: true })); return; }
      const diff = DEPARTURE.getTime() - now.getTime();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, departed: true, tripOver: false }); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        departed: false, tripOver: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Weather fetching
  const fetchWeather = useCallback(async () => {
    setWeatherData(prev => prev.map(w => ({ ...w, loading: true, error: undefined })));
    const results = await Promise.all(
      WEATHER_LOCATIONS.map(async (loc) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FAlmaty&forecast_days=1`;
          const res = await fetch(url);
          const data = await res.json();
          return { location: loc.name, temp: Math.round(data.current.temperature_2m), tempMin: Math.round(data.daily.temperature_2m_min[0]), tempMax: Math.round(data.daily.temperature_2m_max[0]), windSpeed: Math.round(data.current.wind_speed_10m), humidity: data.current.relative_humidity_2m, weatherCode: data.current.weather_code, loading: false };
        } catch { return { location: loc.name, temp: 0, tempMin: 0, tempMax: 0, windSpeed: 0, humidity: 0, weatherCode: 0, loading: false, error: 'Fetch failed' }; }
      })
    );
    setWeatherData(results);
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // Auto-scroll day selector
  useEffect(() => {
    const el = dayScrollRef.current?.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedDay]);

  // Dynamic calculations based on reactive editable itinerary
  const currentDayData = itinerary.find(d => d.day === selectedDay) || itinerary[0] || DEFAULT_ITINERARY_DATA[0];
  const routeLegs = activePlanId === 'plan_b' ? ROUTE_LEGS_PLAN_B : ROUTE_LEGS_PLAN_A;
  const rentalDays = activePlanId === 'plan_b' ? 6 : 3;
  const totalTripKZT = useMemo(() => itinerary.reduce((acc, day) => acc + day.activities.reduce((a, act) => a + act.kztExpense, 0), 0), [itinerary]);
  const maxDayKZT = useMemo(() => Math.max(1, ...itinerary.map(day => day.activities.reduce((a, act) => a + act.kztExpense, 0))), [itinerary]);
  const currRate = EXCHANGE_RATES[selectedCurrency] || EXCHANGE_RATES.INR;
  const currSym = CURRENCY_SYMBOLS[selectedCurrency] || '₹';
  const totalPerPersonConverted = Math.round(totalTripKZT * currRate);
  const currentDayTotal = currentDayData.activities.reduce((s, a) => s + a.kztExpense, 0);
  const budgetPercent = Math.round((currentDayTotal / maxDayKZT) * 100);

  const nowMins = nowMinutes();
  const isToday = (() => {
    const now = new Date();
    return now >= DEPARTURE && now <= TRIP_END;
  })();

  const filteredActivities = currentDayData.activities.filter(act => categoryFilter === 'all' || act.category === categoryFilter);

  const nowIdx = filteredActivities.findIndex(act => {
    const r = parseTimeRange(act.time);
    return r && nowMins >= r.start && nowMins <= r.end;
  });
  const nextIdx = nowIdx >= 0 ? nowIdx + 1 : filteredActivities.findIndex(act => {
    const r = parseTimeRange(act.time);
    return r && nowMins < r.start;
  });

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      window.speechSynthesis.speak(u);
    }
  };

  const handlePrint = () => { if (typeof window !== 'undefined') window.print(); };

  const toggleChecklist = (id: number) =>
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  const mobileNavTabs = [
    { id: 'itinerary', label: 'Today',   icon: Calendar  },
    { id: 'map',       label: 'Map',     icon: Map       },
    { id: 'weather',   label: 'Weather', icon: Sun       },
    { id: 'phrases',   label: 'Phrases', icon: BookOpen  },
    { id: 'more',      label: 'More',    icon: MoreHorizontal },
  ];

  const desktopTabs = [
    { id: 'itinerary',  label: 'Day-by-Day Plan',         icon: Calendar    },
    { id: 'weather',    label: 'Live Weather',             icon: Sun         },
    { id: 'transport',  label: 'Car & Luggage',            icon: Car         },
    { id: 'map',        label: 'Interactive Map',          icon: Map         },
    { id: 'navigation', label: 'Routes & Times',           icon: Navigation  },
    { id: 'phrases',    label: 'Phrasebook',               icon: BookOpen    },
    { id: 'currency',   label: 'Currency & Budget',        icon: DollarSign  },
    { id: 'checklist',  label: 'Packing Checklist',        icon: CheckSquare },
  ];

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-neu-bg text-neu-text transition-colors duration-300 font-body selection:bg-[var(--neu-accent)] selection:text-white`}>

      {/* ── PRINT LAYOUT (Dynamic) ── */}
      <div className="hidden print:block p-8 bg-white text-black">
        <h1 className="text-2xl font-display font-bold mb-1">Kazakhstan 8-Day Master Itinerary</h1>
        <p className="text-sm text-gray-500 mb-6">6 Travelers • Oct 11–18, 2026</p>
        {itinerary.map(day => (
          <div key={day.day} className="print-card mb-4">
            <h2 className="font-bold text-sm border-b pb-1 mb-2">Day {day.day} — {day.date}: {day.title}</h2>
            <p className="text-xs text-gray-500 mb-2">📍 {day.location} | 🏠 {day.overnight}</p>
            {day.activities.map((act, i) => (
              <div key={i} className="mb-2 pl-2 border-l-2 border-gray-300">
                <p className="text-xs font-bold">{act.time} — {act.place} <span className="font-normal text-gray-500">({act.kztExpense.toLocaleString()} KZT)</span></p>
                <p className="text-xs">{act.whatToDo}</p>
                {act.lookOutFor && <p className="text-xs text-amber-700">⚠ {act.lookOutFor}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ══════════════ NEUMORPHIC HEADER ══════════════ */}
      <header className="no-print sticky top-0 z-40 bg-neu-bg/95 backdrop-blur-md neu-flat rounded-b-[28px] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="neu-inset-deep p-2.5 rounded-2xl text-[var(--neu-accent)] shrink-0 flex items-center justify-center">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-[var(--neu-accent)] to-[var(--neu-teal)] bg-clip-text text-transparent truncate">
                Kazakhstan Trip 🇰🇿
              </h1>
              <p className="text-[11px] text-neu-muted hidden sm:flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5" /> 6 Travelers • Oct 11–18, 2026
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Countdown Inset Pill */}
            <div className="neu-inset-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-bold">
              <Timer className="w-3.5 h-3.5 text-[var(--neu-teal)] shrink-0" />
              {countdown.tripOver ? (
                <span className="text-[var(--neu-teal)]">Trip complete ✓</span>
              ) : countdown.departed ? (
                <span className="text-[var(--neu-teal)]">✈️ Underway!</span>
              ) : (
                <span className="text-[var(--neu-teal)]">
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                </span>
              )}
            </div>

            {/* Print Button (Desktop) */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex neu-btn p-2.5 rounded-2xl text-neu-muted hover:text-neu-text transition-all"
              title="Print Itinerary"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Dark / Light Mode Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="neu-btn p-2.5 rounded-2xl text-amber-500 hover:text-amber-400 transition-all flex items-center justify-center"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── 1-TAP PLAN SWITCHER BAR (Navbar Level — Desktop & Mobile) ── */}
        <div className="border-t border-neu-muted/15 px-4 sm:px-6 py-2 bg-neu-bg/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-neu-muted">
              <Zap className="w-3.5 h-3.5 text-[var(--neu-accent)] animate-pulse" />
              <span className="hidden sm:inline">Active Plan:</span>
              <span className="sm:hidden">Plan:</span>
            </div>

            <div className="flex items-center gap-1.5 neu-inset p-1 rounded-2xl flex-1 sm:flex-initial max-w-full">
              <button
                type="button"
                onClick={() => setActivePlanId('plan_a')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlanId === 'plan_a'
                    ? 'neu-flat bg-neu-bg text-[var(--neu-accent)] shadow-sm ring-1 ring-[var(--neu-accent)]/30 font-extrabold'
                    : 'text-neu-muted hover:text-neu-text'
                }`}
              >
                <span>🏔️</span>
                <span>Plan A: Classical Loop</span>
                <span className="hidden lg:inline text-[10px] font-normal text-neu-muted">(Assy Base)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlanId('plan_b')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlanId === 'plan_b'
                    ? 'neu-flat bg-neu-bg text-[var(--neu-accent)] shadow-sm ring-1 ring-[var(--neu-accent)]/40 font-extrabold'
                    : 'text-neu-muted hover:text-neu-text'
                }`}
              >
                <span>♨️</span>
                <span>Plan B: Hot Springs Loop</span>
                <span className="hidden lg:inline text-[10px] font-normal text-neu-muted">(Chundzha)</span>
                <span className="text-[9px] bg-gradient-to-r from-amber-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                  Recommended
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-2 gap-1.5 overflow-x-auto text-xs font-medium scrollbar-none">
          {desktopTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-2xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'neu-inset-deep text-[var(--neu-accent)] font-bold ring-1 ring-[var(--neu-accent)]/30'
                    : 'neu-btn text-neu-muted hover:text-neu-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ══════════════ MAIN CONTENT AREA ══════════════ */}
      <main className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-12 space-y-6">

        {/* ══════════ ITINERARY TAB ══════════ */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">

            {/* Live On-Trip Banner */}
            {isToday && (
              <div className="neu-inset-deep p-4 rounded-[28px] flex items-center gap-3.5 border-l-4 border-[var(--neu-teal)]">
                <span className="text-2xl shrink-0">🧭</span>
                <div>
                  <div className="text-xs font-display font-extrabold uppercase tracking-wider text-[var(--neu-teal)]">
                    You are on the Kazakhstan journey right now!
                  </div>
                  <div className="text-xs text-neu-muted mt-0.5">
                    Activities taking place today are automatically highlighted with real-time indicators below.
                  </div>
                </div>
              </div>
            )}

            {/* Plan Info & Quick Switch Banner */}
            <div className="neu-flat rounded-[28px] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[var(--neu-accent)]">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl shrink-0">{activePlanId === 'plan_b' ? '♨️' : '🏔️'}</span>
                  <span className="font-display font-extrabold text-sm sm:text-base text-neu-text">
                    {activePlanId === 'plan_b' ? 'Plan B: Thermal Springs & Scenic Loop (Autumn Focus)' : 'Plan A: Classical Almaty Base + 3-Day Loop'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[var(--neu-accent)]/15 text-[var(--neu-accent)]">
                    {activePlanId === 'plan_b' ? 'Recommended for Mid-October' : 'Standard 3-Day Car Rental'}
                  </span>
                </div>
                <p className="text-xs text-neu-muted leading-relaxed">
                  {activePlanId === 'plan_b'
                    ? '6-day car rental • Issyk Lake & Turgen Hike on Day 3 • Chundzha hot mineral springs soak • Charyn Canyon on Day 4 morning • Saty homestay Days 4–5 • Singing Dunes Day 6 • Aktau Mountains & Arasan Baths Day 7 • Big Almaty Lake on Day 8.'
                    : '4 nights in Almaty City base • Medeu & Shymbulak Day 2 • Big Almaty Lake Day 3 • Assy Plateau 4x4 guided tour Day 4 • 3-day rental car pickup Day 5 for Charyn & Saty • Kaindy & Kolsai Day 6 • Singing Dunes Day 7.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePlanId(activePlanId === 'plan_b' ? 'plan_a' : 'plan_b')}
                  className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-[var(--neu-accent)] flex items-center justify-center gap-2 active:neu-inset transition-all whitespace-nowrap"
                  title="Switch itinerary plan with 1 tap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch to {activePlanId === 'plan_b' ? 'Plan A (Assy Base)' : 'Plan B (Hot Springs)'}</span>
                </button>
              </div>
            </div>

            {/* Horizontal Day Selector Bar */}
            <div ref={dayScrollRef} className="flex gap-3 overflow-x-auto scrollbar-none py-2 px-1 -mx-2">
              {itinerary.map(day => {
                const isSel = selectedDay === day.day;
                const dayTotal = day.activities.reduce((s, a) => s + a.kztExpense, 0);
                const pct = Math.round((dayTotal / maxDayKZT) * 100);
                const isThisToday = isToday && (() => {
                  const tripStartDate = new Date('2026-10-11');
                  const todayOffset = Math.floor((new Date().getTime() - tripStartDate.getTime()) / 86400000) + 1;
                  return day.day === todayOffset;
                })();

                return (
                  <button
                    key={day.day}
                    data-day={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`flex-shrink-0 p-3.5 rounded-[24px] text-left transition-all w-[100px] sm:w-[110px] relative ${
                      isSel
                        ? 'neu-inset-deep ring-2 ring-[var(--neu-accent)] ring-offset-2 ring-offset-neu-bg text-neu-text'
                        : 'neu-btn text-neu-muted hover:text-neu-text'
                    }`}
                  >
                    {isThisToday && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--neu-teal)] now-pulse" />
                    )}
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">{day.date}</div>
                    <div className="text-base font-display font-extrabold mt-0.5">Day {day.day}</div>
                    <div className="text-[11px] truncate mt-0.5 opacity-85 leading-tight">{day.title.split(' ').slice(0, 3).join(' ')}</div>
                    
                    {/* Micro budget bar */}
                    <div className="mt-2.5 h-1.5 rounded-full neu-inset-sm overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--neu-teal)] to-[var(--neu-accent)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Day Header Hero Card */}
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="neu-inset-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-bold uppercase tracking-wider text-[var(--neu-accent)]">
                    Day {currentDayData.day} • {currentDayData.date}
                  </div>
                  <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold leading-tight">
                      {currentDayData.title}
                    </h2>
                    <button
                      onClick={() => setIsDayEditOpen(true)}
                      className="neu-btn p-1.5 rounded-xl text-neu-muted hover:text-[var(--neu-accent)] active:neu-inset transition-all"
                      title="Edit Day Overview (Title, Location, Overnight Stay)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neu-muted mt-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--neu-teal)]" /> {currentDayData.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                      <Luggage className="w-3.5 h-3.5" /> {currentDayData.overnight}
                    </span>
                  </div>
                </div>

                {/* Day Spend Inset Metric */}
                <div className="neu-inset-deep p-4 rounded-[24px] text-center sm:text-right shrink-0 min-w-[130px]">
                  <div className="text-[10px] text-neu-muted uppercase font-bold tracking-wider">Day Spend</div>
                  <div className="text-xl font-display font-extrabold text-[var(--neu-amber)] font-mono mt-0.5">
                    {(currentDayTotal / 1000).toFixed(0)}K <span className="text-xs font-normal">KZT</span>
                  </div>
                  <div className="text-[10px] text-neu-muted mt-0.5">~{currSym}{Math.round(currentDayTotal * currRate).toLocaleString()} {selectedCurrency} / person</div>
                </div>
              </div>

              {/* Day Budget Inset Track */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-medium text-neu-muted mb-1.5">
                  <span>Relative Spend Intensity</span>
                  <span className="font-mono font-bold text-neu-text">{budgetPercent}% of Peak Day</span>
                </div>
                <div className="h-3 rounded-full neu-inset-sm overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[var(--neu-teal)] via-[var(--neu-accent)] to-[var(--neu-amber)]"
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Category Filter Pills & Add Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                  {['all', 'sightseeing', 'food', 'transit', 'hotel'].map(cat => {
                    const isCat = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isCat
                            ? 'neu-inset-deep text-[var(--neu-accent)] font-bold ring-1 ring-[var(--neu-accent)]/40'
                            : 'neu-btn text-neu-muted hover:text-neu-text'
                        }`}
                      >
                        {cat === 'all' ? 'All Activities' : `${CATEGORY_EMOJI[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                      </button>
                    );
                  })}
                </div>

                {/* Edit Controls & Sync Badge */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAddModal(currentDayData.day)}
                    className="neu-btn px-3.5 py-1.5 rounded-2xl text-xs font-bold text-[var(--neu-teal)] flex items-center gap-1.5 active:neu-inset transition-all"
                    title="Add a new activity to this day"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Activity
                  </button>

                  <div className="neu-inset-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-mono text-neu-muted">
                    <span className={`w-2 h-2 rounded-full ${syncStatus === 'saving' ? 'bg-amber-400 animate-pulse' : syncStatus === 'synced' ? 'bg-[var(--neu-teal)]' : 'bg-slate-400'}`} />
                    <span>{syncStatus === 'saving' ? 'Saving...' : syncStatus === 'synced' ? 'Synced' : 'Local'}</span>
                  </div>

                  <button
                    onClick={handleResetItinerary}
                    className="neu-btn px-2.5 py-1.5 rounded-2xl text-[10px] font-bold text-neu-muted hover:text-[var(--neu-rose)] active:neu-inset transition-all flex items-center gap-1"
                    title="Reset all days to master itinerary"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Quick helper tip banner */}
            <div className="flex items-center justify-between text-[11px] text-neu-muted px-2 pt-1">
              <span className="flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-[var(--neu-accent)] inline shrink-0" />
                <span>Hold <strong>⋮⋮</strong> handle to drag, or tap card to use <strong>▲/▼</strong></span>
              </span>
              <span className="text-[10px] font-mono text-neu-muted/70">{filteredActivities.length} items</span>
            </div>

            {/* Activities List (Accordion-style Neumorphic Cards with Edit Trigger) */}
            <div className="space-y-3.5">
              {filteredActivities.map((act, idx) => {
                const isNow = isToday && idx === nowIdx;
                const isNext = isToday && idx === nextIdx && nowIdx !== -1;
                const isExpanded = expandedActivity === idx;

                return (
                  <div
                    key={idx}
                    data-act-idx={idx}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverIdx !== idx) setDragOverIdx(idx);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIdx !== null && draggedIdx !== idx) {
                        handleMoveActivity(currentDayData.day, draggedIdx, idx);
                      }
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                    }}
                    className={`rounded-[28px] transition-all duration-300 relative ${
                      draggedIdx === idx
                        ? 'opacity-40 scale-[0.98] ring-2 ring-[var(--neu-accent)] ring-dashed z-20'
                        : dragOverIdx === idx
                        ? 'border-t-4 border-[var(--neu-teal)] ring-2 ring-[var(--neu-teal)]/30'
                        : isNow
                        ? 'neu-inset-deep ring-2 ring-[var(--neu-teal)] p-1'
                        : isExpanded
                        ? 'neu-flat p-1'
                        : 'neu-flat hover:neu-flat-hover'
                    }`}
                  >
                    <div
                      className="w-full p-4 sm:p-5 text-left cursor-pointer focus:outline-none"
                      onClick={() => setExpandedActivity(isExpanded ? null : idx)}
                    >
                      <div className="flex items-start gap-3.5">
                        
                        {/* Time Inset Socket */}
                        <div className="shrink-0 text-center min-w-[68px]">
                          <div className="neu-inset-sm px-2 py-1 rounded-xl font-mono text-xs font-bold text-[var(--neu-accent)]">
                            {act.time.split(' - ')[0]}
                          </div>
                          {act.time.split(' - ')[1] && (
                            <div className="text-[10px] text-neu-muted mt-1 font-mono">{act.time.split(' - ')[1]}</div>
                          )}
                        </div>

                        {/* Title & Category Tags */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isNow && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--neu-teal)] text-slate-900 text-[10px] font-extrabold uppercase tracking-wide now-pulse">
                                <Zap className="w-3 h-3" /> NOW
                              </span>
                            )}
                            {isNext && !isNow && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full neu-inset-sm text-[var(--neu-amber)] text-[10px] font-bold uppercase tracking-wide">
                                NEXT
                              </span>
                            )}
                            <span className="font-display font-bold text-base sm:text-lg leading-tight truncate">
                              {act.place}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-neu-muted font-medium">
                            <span>{CATEGORY_EMOJI[act.category]} {act.category}</span>
                            {act.kztExpense > 0 && (
                              <span className="font-mono text-[var(--neu-amber)] font-bold">
                                ~{act.kztExpense >= 1000 ? `${(act.kztExpense/1000).toFixed(0)}K` : act.kztExpense} KZT
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Drag Handle, Edit Button & Chevron Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Press & Hold to Drag / Shuffle Handle */}
                          <button
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              setDraggedIdx(idx);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedIdx(null);
                              setDragOverIdx(null);
                            }}
                            onTouchStart={() => {
                              setDraggedIdx(idx);
                            }}
                            onTouchMove={(e) => {
                              const touch = e.touches[0];
                              const target = document.elementFromPoint(touch.clientX, touch.clientY);
                              const cardEl = target?.closest('[data-act-idx]');
                              if (cardEl) {
                                const targetIdx = Number(cardEl.getAttribute('data-act-idx'));
                                if (!isNaN(targetIdx) && targetIdx !== dragOverIdx) {
                                  setDragOverIdx(targetIdx);
                                }
                              }
                            }}
                            onTouchEnd={() => {
                              if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
                                handleMoveActivity(currentDayData.day, draggedIdx, dragOverIdx);
                              }
                              setDraggedIdx(null);
                              setDragOverIdx(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="touch-none cursor-grab active:cursor-grabbing neu-btn w-8 h-8 rounded-xl text-neu-muted hover:text-[var(--neu-accent)] active:neu-inset transition-all flex items-center justify-center shrink-0 active:scale-110"
                            title="Press & hold to drag & shuffle"
                            aria-label="Press and hold to reorder activity"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(currentDayData.day, act, idx);
                            }}
                            className="neu-btn w-8 h-8 rounded-xl text-[var(--neu-accent)] hover:text-white hover:bg-[var(--neu-accent)] active:neu-inset transition-all flex items-center justify-center shrink-0"
                            title="Edit this activity"
                            aria-label="Edit this activity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <div className="neu-inset-sm p-1.5 rounded-xl text-neu-muted">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Collapsed Preview */}
                      {!isExpanded && (
                        <p className="text-xs text-neu-muted mt-2.5 ml-[82px] leading-relaxed line-clamp-2">
                          {act.whatToDo}
                        </p>
                      )}
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2">
                        <div className="neu-inset rounded-[24px] p-5 space-y-3.5">
                          <div>
                            <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--neu-accent)] flex items-center gap-1.5 mb-1">
                              <Compass className="w-3.5 h-3.5" /> What to Do
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-neu-text">{act.whatToDo}</p>
                          </div>

                          <div>
                            <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--neu-teal)] flex items-center gap-1.5 mb-1">
                              <Coffee className="w-3.5 h-3.5" /> Must Try
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-neu-text">{act.mustTry}</p>
                          </div>

                          {act.lookOutFor && (
                            <div className="neu-inset-sm p-3.5 rounded-2xl border-l-3 border-[var(--neu-amber)]">
                              <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--neu-amber)] flex items-center gap-1.5 mb-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> Look Out For
                              </div>
                              <p className="text-xs leading-relaxed text-neu-muted">{act.lookOutFor}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-neu-muted/20 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openEditModal(currentDayData.day, act, idx)}
                                className="text-xs text-[var(--neu-accent)] font-bold flex items-center gap-1 hover:underline"
                              >
                                <Edit3 className="w-3 h-3" /> Edit Activity Details
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveActivity(currentDayData.day, idx, idx - 1);
                                  }}
                                  className="neu-btn px-2 py-1 rounded-lg text-[11px] font-bold text-neu-muted hover:text-[var(--neu-accent)] disabled:opacity-30 disabled:pointer-events-none active:neu-inset transition-all flex items-center gap-0.5"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" /> Up
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === filteredActivities.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveActivity(currentDayData.day, idx, idx + 1);
                                  }}
                                  className="neu-btn px-2 py-1 rounded-lg text-[11px] font-bold text-neu-muted hover:text-[var(--neu-accent)] disabled:opacity-30 disabled:pointer-events-none active:neu-inset transition-all flex items-center gap-0.5"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" /> Down
                                </button>
                              </div>
                            </div>

                            {act.kztExpense > 0 && (
                              <div className="text-xs font-mono">
                                <span className="text-neu-muted">Cost: </span>
                                <span className="text-[var(--neu-amber)] font-bold">{act.kztExpense.toLocaleString()} KZT</span>
                                <span className="text-neu-muted"> (~{currSym}{Math.round(act.kztExpense * currRate).toLocaleString()} {selectedCurrency})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ LIVE WEATHER TAB ══════════ */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                    <Sun className="w-5 h-5" /> Live Weather Conditions
                  </h2>
                  <p className="text-xs text-neu-muted mt-1">Real-time Open-Meteo forecast API (free, no API key required)</p>
                </div>
                <button
                  onClick={fetchWeather}
                  className="neu-btn px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-[var(--neu-accent)] active:neu-inset"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* 2x2 Weather Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {weatherData.map((w, i) => {
                  const wInfo = weatherCodeInfo(w.weatherCode);
                  const locInfo = WEATHER_LOCATIONS[i];
                  return (
                    <div key={w.location} className="rounded-[28px] neu-flat p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--neu-teal)]">{locInfo.desc}</div>
                          <div className="font-display font-extrabold text-base sm:text-lg">{w.location}</div>
                        </div>
                        <span className="text-3xl">{wInfo.emoji}</span>
                      </div>

                      {w.loading ? (
                        <div className="animate-pulse space-y-2 py-4">
                          <div className="h-8 neu-inset-sm rounded-xl w-24" />
                          <div className="h-4 neu-inset-sm rounded-xl w-32" />
                        </div>
                      ) : w.error ? (
                        <p className="text-xs text-[var(--neu-rose)] py-2">{w.error}</p>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-display font-extrabold">{w.temp}°C</span>
                            <span className="text-xs font-medium text-neu-muted">{wInfo.label}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                            <div className="neu-inset-sm p-2.5 rounded-2xl">
                              <Thermometer className="w-3.5 h-3.5 mx-auto text-amber-500 mb-1" />
                              <div className="text-xs font-bold">{w.tempMax}° / {w.tempMin}°</div>
                              <div className="text-[9px] text-neu-muted">Range</div>
                            </div>
                            <div className="neu-inset-sm p-2.5 rounded-2xl">
                              <Wind className="w-3.5 h-3.5 mx-auto text-cyan-500 mb-1" />
                              <div className="text-xs font-bold">{w.windSpeed} km/h</div>
                              <div className="text-[9px] text-neu-muted">Wind</div>
                            </div>
                            <div className="neu-inset-sm p-2.5 rounded-2xl">
                              <Droplets className="w-3.5 h-3.5 mx-auto text-[var(--neu-teal)] mb-1" />
                              <div className="text-xs font-bold">{w.humidity}%</div>
                              <div className="text-[9px] text-neu-muted">Humidity</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* October Climatology Advice */}
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-3">
              <h3 className="font-display font-bold text-base text-[var(--neu-amber)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> October Climatology & Packing Tips
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {[
                  { place: 'Almaty City', tip: '12–18°C pleasant autumn afternoons, 4–8°C evenings. Warm jacket or fleece required after sunset.' },
                  { place: 'Shymbulak (3200m)', tip: '-2 to 5°C with possible early snow flurries. Thermal inner layer, gloves, and winter windbreaker mandatory.' },
                  { place: 'Charyn Canyon', tip: '15–22°C crisp and scenic in the gorge. Sunglasses, hat, comfortable hiking shoes, and 1.5L water.' },
                  { place: 'Saty Village & Lakes', tip: '8–14°C daytime, drops around 0°C or sub-zero at night. Warm beanie, gloves, and layered thermals required.' },
                  { place: 'Altyn Emel Steppe', tip: '14–20°C dry autumn weather. Afternoon breezes on the Singing Dunes.' },
                ].map(({ place, tip }) => (
                  <div key={place} className="neu-inset-sm p-3.5 rounded-2xl">
                    <span className="font-bold text-[var(--neu-accent)] block mb-1">{place}</span>
                    <span className="text-neu-muted leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ INTERACTIVE MAP TAB ══════════ */}
        {activeTab === 'map' && (
          <div className="rounded-[32px] neu-flat p-4 sm:p-6 space-y-4">
            <div className="px-2">
              <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                <Map className="w-5 h-5" /> Interactive Road Trip Map
              </h2>
              <p className="text-xs text-neu-muted mt-1">
                OpenStreetMap with 11 custom pinned stops and dashed road trip route across Almaty, Charyn, Saty, and Altyn Emel.
              </p>
            </div>
            <div className="neu-inset rounded-[28px] p-2">
              <MapTab isDarkMode={isDarkMode} activePlan={activePlanId} />
            </div>
          </div>
        )}

        {/* ══════════ TRANSPORT TAB ══════════ */}
        {activeTab === 'transport' && (
          <div className="space-y-6">
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                  <Car className="w-5 h-5" /> 6-Person Transport Strategy & Calculator
                </h2>
                <p className="text-xs text-neu-muted mt-1">
                  Compare vehicle configurations for {activePlanId === 'plan_b' ? 'Days 2–7 (6 rental days)' : 'Days 5–8 (3 rental days)'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { id: 'minivan', title: 'Option A: Full 7-Seater Minivan', models: 'Kia Carnival / Hyundai Staria', dailyRate: 75000, pros: 'Fits all 6 + luggage; single driver needed', cons: 'Moderate road clearance for rough sections' },
                  { id: '2crossovers', title: 'Option B: 2× Crossover SUVs', models: '2× Hyundai Tucson / Geely Monjaro', dailyRate: 60000, pros: 'Higher ground clearance; group flexibility', cons: 'Requires 2 drivers with IDP & 2 separate deposits' },
                  { id: 'driver', title: 'Option C: Chauffeured Private Van', models: 'Toyota HiAce / Mercedes Sprinter', dailyRate: 100000, pros: 'Zero liability; driver navigates remote roads', cons: 'Higher daily cost; reduced privacy' },
                ].map(opt => {
                  const isSel = strategyType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setStrategyType(opt.id)}
                      className={`p-5 rounded-[24px] cursor-pointer transition-all ${
                        isSel
                          ? 'neu-inset-deep ring-2 ring-[var(--neu-accent)] ring-offset-2 ring-offset-neu-bg'
                          : 'neu-flat hover:neu-flat-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-base">{opt.title}</span>
                        {isSel && (
                          <div className="neu-inset-sm p-1 rounded-full text-[var(--neu-accent)]">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold text-[var(--neu-amber)] mt-1">
                        ~{opt.dailyRate.toLocaleString()} KZT/day • {rentalDays} days = {(opt.dailyRate * rentalDays).toLocaleString()} KZT total
                      </div>
                      <div className="text-xs text-neu-muted mt-1">{opt.models}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 text-xs">
                        <div className="text-[var(--neu-teal)]">✓ {opt.pros}</div>
                        <div className="text-rose-400">✕ {opt.cons}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Inset Tile */}
              <div className="neu-inset p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-center sm:text-left">
                <div>
                  <div className="text-[10px] text-neu-muted uppercase font-bold tracking-wider">Total Rental Cost ({rentalDays} Days)</div>
                  <div className="text-xl font-display font-extrabold text-[var(--neu-accent)]">
                    ~{((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * rentalDays).toLocaleString()} KZT
                  </div>
                </div>
                <div className="w-full sm:w-px h-px sm:h-10 bg-neu-muted/20" />
                <div>
                  <div className="text-[10px] text-neu-muted uppercase font-bold tracking-wider">Per Person Share (÷6)</div>
                  <div className="text-xl font-display font-extrabold text-[var(--neu-teal)]">
                    ~{Math.round(((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * rentalDays) / 6).toLocaleString()} KZT
                  </div>
                  <div className="text-[10px] text-neu-muted">
                    (~{currSym}{Math.round((((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * rentalDays) / 6) * currRate).toLocaleString()} {selectedCurrency})
                  </div>
                </div>
              </div>
            </div>

            {/* Luggage & Roof Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[28px] neu-flat p-6 space-y-2">
                <h3 className="font-display font-bold text-sm text-[var(--neu-amber)] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Roof Rack Protocol
                </h3>
                <ul className="text-xs text-neu-muted space-y-1.5 leading-relaxed pt-1">
                  <li>• Must have crossbars — never tie cargo directly to the vehicle roof</li>
                  <li>• Use waterproof IPX cargo bags or hard roof box to protect against steppe dust</li>
                  <li>• Keep weight below 50–70 kg max to preserve vehicle stability on gravel tracks</li>
                </ul>
              </div>

              <div className="rounded-[28px] neu-flat p-6 space-y-2">
                <h3 className="font-display font-bold text-sm text-[var(--neu-teal)] flex items-center gap-2">
                  <Luggage className="w-4 h-4" /> 6-Person Luggage Strategy
                </h3>
                <ul className="text-xs text-neu-muted space-y-1.5 leading-relaxed pt-1">
                  <li>• {activePlanId === 'plan_b' ? 'Store main luggage at Almaty hotel or vehicle boot for Chundzha & Saty' : 'Store large hard suitcases at your Almaty hotel luggage room on Day 5 morning'}</li>
                  <li>• Travel with only 1 soft duffel bag per traveler to Saty & Basshi guesthouses</li>
                  <li>• Re-pack all souvenirs and main baggage in Almaty on Day 8 prior to airport transfer</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ ROUTES & TIMES TAB ══════════ */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                <Navigation className="w-5 h-5" /> Local Navigation & Mapping Apps
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="neu-inset-sm p-4 rounded-[24px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-500">Yandex Go & Maps</span>
                    <span className="neu-inset-sm text-[10px] font-bold text-[var(--neu-accent)] px-2 py-0.5 rounded-full">Essential</span>
                  </div>
                  <p className="text-xs text-neu-muted leading-relaxed">
                    Used for all city taxi bookings (select &quot;XL&quot; for 6 passengers) and regional driving routes. Download Almaty region offline map before heading to canyons.
                  </p>
                </div>

                <div className="neu-inset-sm p-4 rounded-[24px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--neu-teal)]">2GIS (Dva GIS)</span>
                    <span className="neu-inset-sm text-[10px] font-bold text-[var(--neu-teal)] px-2 py-0.5 rounded-full">City Precise</span>
                  </div>
                  <p className="text-xs text-neu-muted leading-relaxed">
                    Most accurate offline building entrance guide, Bus 12 schedule to Medeu, metro routes, and local pharmacy/supermarket locations.
                  </p>
                </div>
              </div>
            </div>

            {/* Route Leg Matrix */}
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <h3 className="font-display font-bold text-base flex items-center gap-2 text-[var(--neu-teal)]">
                <Compass className="w-4 h-4" /> Distance & Driving Time Matrix ({activePlanId === 'plan_b' ? 'Plan B: Thermal Springs Circuit' : 'Plan A: Classical Loop'})
              </h3>
              <div className="space-y-2.5 pt-1">
                {routeLegs.map((leg, idx) => (
                  <div key={idx} className="neu-flat-sm p-4 rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {leg.from} → <span className="text-[var(--neu-accent)]">{leg.to}</span>
                      </div>
                      <div className="text-[11px] text-neu-muted mt-0.5">{leg.road}</div>
                    </div>
                    <div className="shrink-0 text-right font-mono">
                      <div className="text-xs sm:text-sm font-bold text-[var(--neu-amber)]">{leg.time}</div>
                      <div className="text-[10px] text-neu-muted">{leg.dist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ PHRASEBOOK TAB ══════════ */}
        {activeTab === 'phrases' && (
          <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                  <BookOpen className="w-5 h-5" /> Russian & Kazakh Phrasebook
                </h2>
                <p className="text-xs text-neu-muted mt-1">Tap 🔊 to hear voice pronunciation aloud via speech synthesis</p>
              </div>

              {/* Phrase Category Filters */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                {['all', 'Greetings', 'Taxi', 'Shopping', 'Emergency'].map(cat => {
                  const isCat = phraseFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setPhraseFilter(cat)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isCat
                          ? 'neu-inset-deep text-[var(--neu-accent)] font-bold ring-1 ring-[var(--neu-accent)]/30'
                          : 'neu-btn text-neu-muted hover:text-neu-text'
                      }`}
                    >
                      {cat === 'Emergency' ? '🚨 ' + cat : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phrases List */}
            <div className="space-y-3 pt-2">
              {PHRASES.filter(p => phraseFilter === 'all' || p.cat === phraseFilter).map((p, idx) => (
                <div key={idx} className="neu-flat rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--neu-accent)]">{p.cat}</div>
                    <div className="font-display font-bold text-base mt-0.5">{p.mean}</div>
                    <div className="text-sm font-semibold text-[var(--neu-teal)] mt-0.5">{p.ru}</div>
                    <div className="text-xs text-neu-muted italic mt-0.5">&quot;{p.trans}&quot;</div>
                  </div>
                  <button
                    onClick={() => speakText(p.ru)}
                    className="neu-btn p-3 rounded-2xl text-[var(--neu-teal)] hover:text-[var(--neu-accent)] active:neu-inset shrink-0 transition-all"
                    title="Pronounce"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ CURRENCY & BUDGET TAB ══════════ */}
        {activeTab === 'currency' && (
          <div className="space-y-6">
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                  <DollarSign className="w-5 h-5" /> Currency Converter & Budget Calculator
                </h2>
                <p className="text-xs text-neu-muted mt-1">Rates benchmark: 1 INR ≈ 5.7 KZT (1 KZT ≈ ₹0.175) • 1 USD ≈ 475 KZT • 1 EUR ≈ 525 KZT</p>
              </div>

              {/* Converter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-neu-muted mb-1.5 block">Amount (KZT)</label>
                  <input
                    type="number"
                    value={kztAmount}
                    onChange={e => setKztAmount(Number(e.target.value))}
                    className="w-full neu-inset-deep rounded-2xl px-4 py-3.5 font-mono text-lg font-bold text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neu-muted mb-1.5 block">Target Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={e => setSelectedCurrency(e.target.value)}
                    className="w-full neu-btn rounded-2xl px-4 py-3.5 font-bold text-neu-text outline-none"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div className="neu-inset rounded-2xl p-4 flex flex-col justify-center text-center sm:text-right">
                  <div className="text-[10px] text-neu-muted uppercase font-bold tracking-wider">Converted Equivalent</div>
                  <div className="text-2xl font-display font-extrabold text-[var(--neu-teal)] font-mono mt-0.5">
                    {currSym}{(kztAmount * (EXCHANGE_RATES[selectedCurrency] || EXCHANGE_RATES.INR)).toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}
                  </div>
                </div>
              </div>
            </div>

            {/* All 8 Days Budget Bars (Dynamically Recalculated) */}
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <h3 className="font-display font-bold text-base">Full 8-Day Estimated Spending Breakdown</h3>
              <div className="space-y-3 pt-1">
                {itinerary.map(day => {
                  const total = day.activities.reduce((s, a) => s + a.kztExpense, 0);
                  const pct = Math.round((total / maxDayKZT) * 100);
                  return (
                    <div key={day.day} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Day {day.day} <span className="text-neu-muted hidden sm:inline">— {day.title}</span></span>
                        <span className="font-mono font-bold text-[var(--neu-amber)]">{(total/1000).toFixed(0)}K KZT</span>
                      </div>
                      <div className="h-2.5 rounded-full neu-inset-sm overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[var(--neu-teal)] to-[var(--neu-accent)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-center">
                <div className="neu-inset-sm p-3.5 rounded-2xl">
                  <div className="text-[10px] text-neu-muted uppercase">Per Person Total</div>
                  <div className="text-sm sm:text-base font-bold text-[var(--neu-accent)] mt-0.5">~{totalTripKZT.toLocaleString()} KZT</div>
                  <div className="text-[10px] text-neu-muted mt-0.5">~{currSym}{totalPerPersonConverted.toLocaleString()} {selectedCurrency}</div>
                </div>
                <div className="neu-inset-sm p-3.5 rounded-2xl">
                  <div className="text-[10px] text-neu-muted uppercase">Group Total (×6)</div>
                  <div className="text-sm sm:text-base font-bold text-[var(--neu-teal)] mt-0.5">~{(totalTripKZT * 6).toLocaleString()} KZT</div>
                  <div className="text-[10px] text-neu-muted mt-0.5">~{currSym}{(totalPerPersonConverted * 6).toLocaleString()} {selectedCurrency}</div>
                </div>
                <div className="neu-inset-sm p-3.5 rounded-2xl">
                  <div className="text-[10px] text-neu-muted uppercase">Cash Needed</div>
                  <div className="text-sm sm:text-base font-bold text-[var(--neu-amber)] mt-0.5">~200,000 KZT</div>
                  <div className="text-[10px] text-neu-muted mt-0.5">Saty/Basshi (~{currSym}{Math.round(200000 * currRate).toLocaleString()})</div>
                </div>
                <div className="neu-inset-sm p-3.5 rounded-2xl">
                  <div className="text-[10px] text-neu-muted uppercase">Activities/Passes</div>
                  <div className="text-sm sm:text-base font-bold text-cyan-500 mt-0.5">~20K KZT</div>
                  <div className="text-[10px] text-neu-muted mt-0.5">Per person (~{currSym}{Math.round(20000 * currRate).toLocaleString()})</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ PACKING CHECKLIST TAB ══════════ */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-extrabold flex items-center gap-2 text-[var(--neu-accent)]">
                    <CheckSquare className="w-5 h-5" /> Expedition Packing Checklist
                  </h2>
                  <p className="text-xs text-neu-muted mt-1">
                    State is saved locally per browser device ({packingItems.filter(i => i.checked).length} of {packingItems.length} packed)
                  </p>
                </div>
                <button
                  onClick={() => setCheckedIds(DEFAULT_CHECKED_IDS)}
                  className="neu-btn px-3 py-1.5 rounded-xl text-xs text-neu-muted hover:text-neu-text active:neu-inset transition-all"
                  title="Reset to default items"
                >
                  Reset
                </button>
              </div>

              {/* Checklist Progress Bar */}
              <div className="h-3 rounded-full neu-inset-sm overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[var(--neu-teal)] to-[var(--neu-accent)]"
                  style={{ width: `${Math.round((packingItems.filter(i => i.checked).length / packingItems.length) * 100)}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5 pt-2">
                {packingItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all ${
                      item.checked
                        ? 'neu-inset-sm opacity-85'
                        : 'neu-flat hover:neu-flat-hover'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        item.checked
                          ? 'neu-inset-deep bg-[var(--neu-teal)] text-slate-900 shadow-none'
                          : 'neu-inset text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm font-medium leading-tight ${item.checked ? 'line-through text-neu-muted' : 'text-neu-text'}`}>
                        {item.text}
                      </span>
                    </div>
                    <span className="neu-inset-sm text-[10px] font-mono px-2 py-0.5 rounded-lg text-neu-muted shrink-0">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Numbers Card */}
            <div className="rounded-[32px] neu-flat p-6 sm:p-8 space-y-3">
              <h3 className="font-display font-bold text-base text-[var(--neu-rose)] flex items-center gap-2">
                <PhoneCall className="w-4 h-4" /> Emergency Phone Contacts (Kazakhstan)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { label: 'Rescue / Fire', number: '101' },
                  { label: 'Police', number: '102' },
                  { label: 'Ambulance', number: '103' },
                  { label: 'Universal', number: '112' },
                ].map(e => (
                  <a
                    key={e.label}
                    href={`tel:${e.number}`}
                    className="neu-btn p-3.5 rounded-2xl text-center block transition-all active:neu-inset"
                  >
                    <div className="text-[10px] text-neu-muted uppercase font-bold">{e.label}</div>
                    <div className="text-xl font-display font-extrabold text-[var(--neu-rose)] font-mono mt-0.5">{e.number}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ MORE HUB (MOBILE) ══════════ */}
        {activeTab === 'more' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { id: 'currency',   label: 'Currency & Budget',   icon: DollarSign,  desc: 'Converter + 8-day breakdown' },
                { id: 'transport',  label: 'Car & Luggage',        icon: Car,         desc: '3 vehicle options + share calc' },
                { id: 'navigation', label: 'Routes & Times',       icon: Navigation,  desc: 'Leg distances & mapping apps' },
                { id: 'checklist',  label: 'Packing Checklist',    icon: CheckSquare, desc: `${packingItems.filter(i => i.checked).length}/${packingItems.length} packed` },
                { id: 'weather',    label: 'Live Weather',         icon: Sun,         desc: 'Real-time forecasts for 4 stops' },
                { id: 'map',        label: 'Interactive Map',      icon: Map,         desc: '11 stops & road trip route' },
              ].map(sec => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className="neu-btn p-5 rounded-[28px] text-left transition-all active:neu-inset"
                  >
                    <div className="neu-inset-sm w-10 h-10 rounded-2xl flex items-center justify-center mb-3 text-[var(--neu-accent)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display font-bold text-sm leading-tight">{sec.label}</div>
                    <div className="text-[11px] text-neu-muted mt-1 leading-snug">{sec.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Quick Currency Converter Card */}
            <div className="rounded-[32px] neu-flat p-6 space-y-3">
              <h3 className="font-display font-bold text-sm flex items-center gap-2 text-[var(--neu-accent)]">
                <DollarSign className="w-4 h-4" /> Quick KZT Converter
              </h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={kztAmount}
                  onChange={e => setKztAmount(Number(e.target.value))}
                  className="flex-1 neu-inset-deep rounded-2xl p-3 font-mono font-bold text-base outline-none"
                />
                <select
                  value={selectedCurrency}
                  onChange={e => setSelectedCurrency(e.target.value)}
                  className="neu-btn p-3 rounded-2xl font-bold text-sm outline-none"
                >
                  <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
                </select>
              </div>
              <div className="neu-inset p-3.5 rounded-2xl text-center">
                <div className="text-xl font-display font-extrabold text-[var(--neu-teal)] font-mono">
                  {currSym}{(kztAmount * (EXCHANGE_RATES[selectedCurrency] || EXCHANGE_RATES.INR)).toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}
                </div>
              </div>
            </div>

            {/* Print Full Itinerary Button */}
            <button
              onClick={handlePrint}
              className="w-full neu-btn p-4 rounded-[28px] flex items-center justify-center gap-2 text-xs font-bold text-neu-text active:neu-inset transition-all"
            >
              <Printer className="w-4 h-4 text-neu-muted" /> Print Full 8-Day Itinerary
            </button>
          </div>
        )}

      </main>

      {/* ══════════════ MOBILE BOTTOM NAVIGATION ══════════════ */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-50 neu-flat rounded-t-[28px] pb-safe px-2 py-2">
        <div className="flex items-center justify-around">
          {mobileNavTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'more' && !mobileNavTabs.slice(0, 4).some(t => t.id === activeTab));
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1.5 px-3.5 rounded-2xl transition-all min-w-[56px] ${
                  isActive
                    ? 'neu-inset-deep text-[var(--neu-accent)] font-bold ring-1 ring-[var(--neu-accent)]/30'
                    : 'text-neu-muted hover:text-neu-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ══════════════ FLOATING EMERGENCY FAB ══════════════ */}
      <button
        onClick={() => setShowEmergency(true)}
        className="no-print fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full neu-btn bg-[var(--neu-rose)] text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        title="Emergency Help"
      >
        <PhoneCall className="w-5 h-5 text-white" />
      </button>

      {/* ══════════════ ACTIVITY EDIT MODAL ══════════════ */}
      {editModal.isOpen && (
        <ActivityEditModal
          key={`${editModal.dayNumber}-${editModal.activityIndex ?? 'new'}-${editModal.activity.place}`}
          isOpen={editModal.isOpen}
          activity={editModal.activity}
          dayNumber={editModal.dayNumber}
          activityIndex={editModal.activityIndex}
          isNew={editModal.isNew}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* ══════════════ DAY OVERVIEW EDIT MODAL ══════════════ */}
      {isDayEditOpen && (
        <DayEditModal
          key={`day-${currentDayData.day}-${currentDayData.title}`}
          isOpen={isDayEditOpen}
          dayData={currentDayData}
          onSave={handleSaveDay}
          onClose={() => setIsDayEditOpen(false)}
        />
      )}

      {/* ══════════════ EMERGENCY MODAL ══════════════ */}
      {showEmergency && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmergency(false)}>
          <div
            className="neu-flat rounded-[32px] p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-[var(--neu-rose)] flex items-center gap-2">
                <PhoneCall className="w-5 h-5" /> Emergency Contacts
              </h3>
              <button
                onClick={() => setShowEmergency(false)}
                className="neu-btn p-2 rounded-xl text-neu-muted hover:text-neu-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Rescue / Fire', number: '101' },
                { label: 'Police', number: '102' },
                { label: 'Ambulance', number: '103' },
                { label: 'Universal', number: '112' },
              ].map(e => (
                <a
                  key={e.label}
                  href={`tel:${e.number}`}
                  className="neu-flat-sm p-4 rounded-2xl text-center block transition-all active:neu-inset"
                >
                  <div className="text-[10px] text-neu-muted uppercase font-bold">{e.label}</div>
                  <div className="text-2xl font-display font-extrabold text-[var(--neu-rose)] font-mono mt-0.5">{e.number}</div>
                  <div className="text-[9px] text-neu-muted mt-0.5">Tap to call</div>
                </a>
              ))}
            </div>

            <a
              href="tel:+77272703333"
              className="neu-flat-sm p-4 rounded-2xl flex items-center justify-between transition-all active:neu-inset block"
            >
              <div>
                <div className="text-[10px] text-neu-muted uppercase font-bold">Almaty Airport Support</div>
                <div className="font-mono font-bold text-sm text-[var(--neu-rose)] mt-0.5">+7 727 270 3333</div>
              </div>
              <PhoneCall className="w-4 h-4 text-[var(--neu-rose)]" />
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
