'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar, MapPin, Compass, Car, Luggage, DollarSign, BookOpen,
  CheckSquare, Volume2, ShieldAlert, PhoneCall,
  Sun, Moon, AlertTriangle, Navigation, Clock,
  Users, Check, RefreshCw, Calculator, Coffee,
  Printer, Wind, Thermometer, Droplets, Map, Timer,
  ChevronDown, ChevronUp, Menu, X, Zap, MoreHorizontal,
} from 'lucide-react';

const MapTab = dynamic(() => import('./MapTab'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Activity {
  time: string;
  place: string;
  whatToDo: string;
  mustTry: string;
  lookOutFor: string;
  kztExpense: number;
  category: 'sightseeing' | 'food' | 'transit' | 'hotel';
}
interface DayData {
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

// ─── Itinerary Data ───────────────────────────────────────────────────────────
const ITINERARY_DATA: DayData[] = [
  {
    day: 1, date: 'Sun, Sep 11', title: 'Arrival & Almaty City Culture',
    overnight: 'Almaty City Hotel (Base 1)', location: 'Almaty City',
    activities: [
      { time: '09:50 - 12:30', place: 'Almaty Airport (ALA)', whatToDo: 'Immigration, baggage claim, buy local Beeline/Tele2 SIM, order Yandex XL Taxi to hotel.', mustTry: 'Local SIM card setup at arrivals', lookOutFor: 'Ignore aggressive unlicensed airport taxi drivers; stick strictly to Yandex Go app', kztExpense: 4000, category: 'transit' },
      { time: '12:30 - 13:30', place: 'City Hotel', whatToDo: 'Hotel check-in or drop luggage in storage.', mustTry: 'Request early check-in or store bags', lookOutFor: 'Keep passports handy', kztExpense: 0, category: 'hotel' },
      { time: '13:30 - 15:00', place: 'Navat / Tandir Restaurant', whatToDo: 'Traditional Kazakh & Central Asian kick-off lunch.', mustTry: 'Boshu Lagman (hand-pulled noodles) & Manti', lookOutFor: 'Portion sizes are generous for sharing', kztExpense: 4500, category: 'food' },
      { time: '15:30 - 17:00', place: 'Green Bazaar (Zelyony Bazar)', whatToDo: 'Explore historic market stalls, spices, meats, and dried fruits.', mustTry: 'Kurt (salted cheese balls), local mountain honey, dried apricots', lookOutFor: 'Closed on Mondays! Cash only for stall vendors', kztExpense: 3000, category: 'sightseeing' },
      { time: '17:30 - 18:30', place: 'Panfilov Park & Zenkov Cathedral', whatToDo: 'Walk through leafy park and visit the famous 19th-century wooden cathedral built without nails.', mustTry: 'Intricate wooden architecture photo spots', lookOutFor: 'Modest dress code inside cathedral', kztExpense: 0, category: 'sightseeing' },
      { time: '18:30 - 20:00', place: 'Arbat Pedestrian Street', whatToDo: 'Evening promenade, street musicians, local art galleries.', mustTry: 'Street performances & artisan crafts', lookOutFor: 'Watch out for cyclists on pedestrian paths', kztExpense: 1500, category: 'sightseeing' },
      { time: '20:00 - 22:00', place: 'City Center Dinner', whatToDo: 'Dinner & Craft drinks / Georgian feast.', mustTry: "Shashlik, Khachapuri or local craft beer at Harat's", lookOutFor: 'Card payments widely accepted in Almaty city', kztExpense: 6000, category: 'food' },
    ],
  },
  {
    day: 2, date: 'Mon, Sep 12', title: 'High Altitude Rink, Peaks & Sunset',
    overnight: 'Almaty City Hotel (Base 1)', location: 'Medeu & Shymbulak',
    activities: [
      { time: '09:00 - 10:00', place: 'Dostyk Ave Cafe', whatToDo: 'Breakfast and specialty coffee.', mustTry: 'Syrniki (cottage cheese pancakes) with berry jam', lookOutFor: 'Top up Onay bus card or keep contactless bank card ready', kztExpense: 3000, category: 'food' },
      { time: '10:00 - 11:30', place: 'Medeu Speed Skating Rink', whatToDo: 'Ride public Bus No. 12 from Dostyk Ave (~40 mins) to Medeu valley.', mustTry: 'Panoramas of highest ice rink in the world', lookOutFor: 'Bus can get crowded on pleasant mornings', kztExpense: 200, category: 'transit' },
      { time: '12:00 - 15:30', place: 'Shymbulak & Talgar Pass (3200m)', whatToDo: 'Ride 3-stage cable car up to Talgar Pass for high mountain peaks.', mustTry: 'Chalet dining at 3200 Cafe, crisp glacier air', lookOutFor: 'Temperatures are 10°C colder than city; wear extra thermal layer', kztExpense: 12000, category: 'sightseeing' },
      { time: '16:00 - 17:00', place: 'Return to City', whatToDo: 'Take bus or Yandex Taxi back down Dostyk Avenue.', mustTry: 'Rest legs on transit', lookOutFor: 'Afternoon traffic peaks around 17:30', kztExpense: 1000, category: 'transit' },
      { time: '17:00 - 19:30', place: 'Kok Tobe Hilltop', whatToDo: 'Aerial cable car from Dostyk Ave to Kok Tobe park for sunset over Almaty.', mustTry: 'Almaty Tower view & sunset photos', lookOutFor: 'Cable car ticket ~1,250 KZT roundtrip', kztExpense: 1250, category: 'sightseeing' },
      { time: '20:00 - 22:00', place: 'City Center Dinner', whatToDo: 'Dinner and drinks.', mustTry: 'Traditional Kazakh Beshbarmak noodle plate', lookOutFor: 'Hydrate well after altitude', kztExpense: 6500, category: 'food' },
    ],
  },
  {
    day: 3, date: 'Tue, Sep 13', title: 'Big Almaty Lake (BAO) & Arasan Baths',
    overnight: 'Almaty City Hotel (Base 1)', location: 'Big Almaty Lake & City',
    activities: [
      { time: '08:30 - 13:00', place: 'Big Almaty Lake (BAO)', whatToDo: 'Take Yandex Taxi to hydro-station barrier; walk final scenic section up to alpine reservoir.', mustTry: 'Turquoise mountain mirror lake reflections', lookOutFor: 'MANDATORY: Carry original passports (border patrol zone near Kyrgyzstan)', kztExpense: 4000, category: 'sightseeing' },
      { time: '13:00 - 15:00', place: 'Almarasan Gorge', whatToDo: 'Descend to riverside restaurants in Almarasan canyon.', mustTry: 'Freshly grilled mountain trout & lamb shashlik', lookOutFor: 'Check trout price per 100 grams before ordering', kztExpense: 6000, category: 'food' },
      { time: '16:00 - 18:30', place: 'Arasan Bathhouse', whatToDo: 'Historic Soviet/Kazakh public bathhouse recovery session.', mustTry: 'Venik (oak leaf bundle) sauna massage & cold plunge pool', lookOutFor: 'Gender-segregated; bring rubber slippers and towel', kztExpense: 3500, category: 'sightseeing' },
      { time: '19:30 - 21:30', place: 'City Center Dinner', whatToDo: 'Relaxed city dinner.', mustTry: 'Kazakh horse meat delicacies (Kazy) or Georgian wine', lookOutFor: 'Early night before early morning tour', kztExpense: 5500, category: 'food' },
    ],
  },
  {
    day: 4, date: 'Wed, Sep 14', title: 'Guided Tour: Assy Plateau & Turgen',
    overnight: 'Almaty City Hotel (Base 1)', location: 'Assy Plateau & Turgen Gorge',
    activities: [
      { time: '08:00 - 11:30', place: 'Turgen Gorge', whatToDo: 'Board 4x4 tour vehicle from hotel; drive through Turgen mountain river gorge.', mustTry: 'Bear Waterfall walk', lookOutFor: 'Tour operator drives extreme riverbed off-road sections', kztExpense: 15000, category: 'sightseeing' },
      { time: '11:30 - 15:30', place: 'Assy Plateau & Soviet Observatory', whatToDo: 'Explore vast high-altitude steppe (2700m), rivers, nomads, and lone Soviet observatory dome.', mustTry: 'Nomadic yurt photo ops & outdoor group picnic', lookOutFor: 'Zero cellular network on plateau; pack thermal jacket', kztExpense: 0, category: 'sightseeing' },
      { time: '15:30 - 18:30', place: 'Return Drive to Almaty', whatToDo: 'Scenic descent back down Turgen valley to city.', mustTry: 'Mountain honey roadside stalls', lookOutFor: 'Keep camera ready for wild horse herds', kztExpense: 1000, category: 'transit' },
      { time: '19:00 - 21:30', place: 'Almaty City Dinner', whatToDo: 'Hotel drop-off; evening dinner in Almaty.', mustTry: 'Craft burger or Italian dinner at Parmigiano', lookOutFor: 'Rest well before 3-day road trip tomorrow', kztExpense: 5000, category: 'food' },
    ],
  },
  {
    day: 5, date: 'Thu, Sep 15', title: 'Car Rental → Charyn Canyon → Saty',
    overnight: 'Saty Village Guesthouse (Base 2)', location: 'Charyn & Saty',
    activities: [
      { time: '08:30 - 09:30', place: 'Almaty Car Pickup', whatToDo: 'Pick up 3-day rental minivan/crossover. Leave main suitcases at Almaty hotel storage.', mustTry: 'Inspect rental vehicle tires, spare tire, & jack carefully', lookOutFor: 'Ensure driver has International Driving Permit (IDP)', kztExpense: 10000, category: 'transit' },
      { time: '09:30 - 13:30', place: 'Highway A3 / Baiseit Village', whatToDo: 'Drive ~200 km to Charyn Canyon entrance. Stop at Baiseit village market.', mustTry: 'Fresh hot Tandir Samsa at Baiseit roadside stall', lookOutFor: 'Observe speed limits (50 km/h in villages, traffic police enforce with radar)', kztExpense: 1000, category: 'transit' },
      { time: '13:30 - 16:30', place: 'Charyn Canyon (Valley of Castles)', whatToDo: 'Hike 2.5 km down dramatic red rock canyon gorge down to Charyn River.', mustTry: 'Eco-bus option back uphill if exhausted', lookOutFor: 'Intense midday heat; entry fee ~850 KZT/person; carry minimum 2L water', kztExpense: 850, category: 'sightseeing' },
      { time: '16:30 - 17:30', place: 'Black Canyon', whatToDo: '20-min photo stop directly along main highway overlook.', mustTry: 'Sheer vertical canyon cliff view down to rushing river', lookOutFor: 'No barrier edge; stay safe while taking photos', kztExpense: 0, category: 'sightseeing' },
      { time: '18:30 - 21:00', place: 'Saty Village Guesthouse', whatToDo: 'Arrive at Saty family guesthouse. Check-in and enjoy hearty homemade dinner.', mustTry: 'Baursak (fried dough), fresh sheep/cow cheese, hot mountain tea', lookOutFor: 'Cash only in Saty village (KZT); no ATM or card readers', kztExpense: 8000, category: 'hotel' },
    ],
  },
  {
    day: 6, date: 'Fri, Sep 16', title: 'Submerged Forest (Kaindy) & Kolsai Lakes',
    overnight: 'Saty Village Guesthouse (Base 2)', location: 'Kaindy & Kolsai Lakes',
    activities: [
      { time: '08:00 - 09:00', place: 'Saty Guesthouse Breakfast', whatToDo: 'Guesthouse home breakfast.', mustTry: 'Fresh farm eggs, homemade berry jams', lookOutFor: 'Pack warm windbreaker jacket', kztExpense: 0, category: 'food' },
      { time: '09:00 - 13:00', place: 'Lake Kaindy', whatToDo: 'Hire local Soviet UAZ 4x4 Bukhanka van from Saty. Hike/horse ride to submerged birch tree forest lake.', mustTry: 'Spruce trees standing upright in turquoise water', lookOutFor: 'DO NOT drive rental car here (riverbed tracks break standard cars). Eco-fee ~850 KZT', kztExpense: 3500, category: 'sightseeing' },
      { time: '13:00 - 14:30', place: 'Saty Village Lunch', whatToDo: 'Return to village for hot guesthouse lunch.', mustTry: 'Traditional Lagman or Kuurdak', lookOutFor: 'Rest up before afternoon lake stroll', kztExpense: 3000, category: 'food' },
      { time: '15:00 - 18:30', place: 'Lower Kolsai Lake', whatToDo: 'Drive 20 mins on smooth asphalt road to Lower Kolsai Lake.', mustTry: 'Wooden rowboat rental on turquoise alpine lake', lookOutFor: 'Rowboat ~5000 KZT / 30 mins; late afternoon golden hour lighting', kztExpense: 3000, category: 'sightseeing' },
      { time: '19:30 - 21:30', place: 'Saty Village — Stargazing', whatToDo: 'Dinner and stargazing in guesthouse courtyard.', mustTry: 'Unpolluted mountain night sky views', lookOutFor: 'Night temps drop fast', kztExpense: 0, category: 'hotel' },
    ],
  },
  {
    day: 7, date: 'Sat, Sep 17', title: 'Drive to Altyn Emel (Singing Dunes)',
    overnight: 'Basshi Village Guesthouse (Base 3)', location: 'Altyn Emel National Park',
    activities: [
      { time: '07:00 - 11:30', place: 'Saty → Basshi Drive', whatToDo: 'Early check-out & drive 250 km via Chilik and Kokpek pass to Basshi village.', mustTry: 'Scenic steppe landscapes', lookOutFor: 'Start early to avoid navigating unlit dirt tracks at night', kztExpense: 4000, category: 'transit' },
      { time: '12:00 - 13:00', place: 'Basshi Village Office', whatToDo: 'Register vehicle and pay entry tickets at Altyn Emel National Park headquarters.', mustTry: 'Local village lunch at Basshi', lookOutFor: 'Keep park permit receipt visible on car dashboard', kztExpense: 1500, category: 'transit' },
      { time: '13:30 - 17:00', place: 'Singing Dunes (Altyn Emel)', whatToDo: 'Drive 1-hour washboard gravel track to Singing Dunes. Climb dune ridge and slide down.', mustTry: 'Hear the loud organ-like hum produced by vibrating sand', lookOutFor: 'Cap driving speed at 40 km/h on gravel; wear sunglasses, hat, and sunscreen', kztExpense: 0, category: 'sightseeing' },
      { time: '18:00 - 21:00', place: 'Basshi Village Guesthouse', whatToDo: 'Check-in to local Basshi guesthouse. Dinner and rest.', mustTry: 'Homestyle Kazakh nomadic hospitality', lookOutFor: 'Cash for guesthouse stay', kztExpense: 8000, category: 'hotel' },
    ],
  },
  {
    day: 8, date: 'Sun, Sep 18', title: 'Return Almaty, Souvenirs & Airport',
    overnight: 'Flight Departure', location: 'Almaty & Departure',
    activities: [
      { time: '07:30 - 11:30', place: 'Basshi → Almaty Highway', whatToDo: 'Drive 255 km back to Almaty via Qonaev (Kapchagay) toll highway.', mustTry: 'Lake Kapchagay view along highway', lookOutFor: 'Refuel at Qazaq Oil or Compass gas station near highway', kztExpense: 3000, category: 'transit' },
      { time: '12:00 - 12:30', place: 'Rental Car Return', whatToDo: 'Return rental car (clean interior, full fuel tank).', mustTry: 'Retrieve stored main suitcases from hotel', lookOutFor: 'Rental drop-off inspection', kztExpense: 0, category: 'transit' },
      { time: '12:30 - 14:00', place: 'Panfilov St Cafe', whatToDo: 'Lunch along pedestrian avenue.', mustTry: 'Craft coffee & Central Asian baked pastries', lookOutFor: 'Relaxed urban vibe', kztExpense: 4000, category: 'food' },
      { time: '14:00 - 16:00', place: 'Central State Museum', whatToDo: 'Explore Kazakh nomadic history and archaeological treasures.', mustTry: 'Golden Man (Altyn Adam) ancient warrior exhibit', lookOutFor: 'Museum ticket ~1,000 KZT', kztExpense: 1000, category: 'sightseeing' },
      { time: '16:00 - 17:30', place: 'Rakhat Chocolate Factory', whatToDo: 'Souvenir shopping at official factory outlet on Zenkov Street.', mustTry: 'Signature blue-wrapped "Kazakhstan" chocolate bars and tins', lookOutFor: 'Factory store offers best wholesale prices', kztExpense: 5000, category: 'sightseeing' },
      { time: '18:00 - 19:30', place: 'Farewell Dinner', whatToDo: 'Final celebratory dinner in Almaty.', mustTry: 'Gosti or Kishlak farewell feast', lookOutFor: 'Allow 45 mins transit time to airport', kztExpense: 6000, category: 'food' },
      { time: '20:00 - 22:30', place: 'Almaty Airport (ALA)', whatToDo: 'Yandex XL Taxi to airport; check-in 3 hours prior to departure.', mustTry: 'Safe journey home!', lookOutFor: 'Ensure no liquids or souvenirs exceed hand baggage limits', kztExpense: 4000, category: 'transit' },
    ],
  },
];

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

const ROUTE_LEGS = [
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

const WEATHER_LOCATIONS = [
  { name: 'Almaty', lat: 43.222, lon: 76.8512, desc: 'City base' },
  { name: 'Charyn Canyon', lat: 43.35, lon: 79.067, desc: 'Day 5 canyon' },
  { name: 'Saty / Kolsai', lat: 42.917, lon: 78.317, desc: 'Days 5–6 alpine' },
  { name: 'Altyn Emel', lat: 44.083, lon: 78.383, desc: 'Day 7 steppe' },
];

const EXCHANGE_RATES: Record<string, number> = {
  USD: 0.0021, INR: 0.175, EUR: 0.0019, GBP: 0.00165,
};

const DEPARTURE = new Date('2026-09-11T09:50:00+06:00');
const TRIP_END   = new Date('2026-09-18T23:59:00+06:00');
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KazakhstanApp() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [kztAmount, setKztAmount] = useState(100000);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [strategyType, setStrategyType] = useState('minivan');
  const [phraseFilter, setPhraseFilter] = useState('all');
  const dayScrollRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, departed: false, tripOver: false });
  const [weatherData, setWeatherData] = useState<WeatherData[]>(
    WEATHER_LOCATIONS.map(l => ({ location: l.name, temp: 0, tempMin: 0, tempMax: 0, windSpeed: 0, humidity: 0, weatherCode: 0, loading: true }))
  );
  const [packingItems, setPackingItems] = useState<PackingItem[]>([
    { id: 1, text: 'Original Passports (MANDATORY for Big Almaty Lake border check)', checked: true, category: 'Docs' },
    { id: 2, text: 'International Driving Permit (IDP) + License', checked: true, category: 'Docs' },
    { id: 3, text: 'Cash KZT (~150,000–200,000 KZT for Saty/Basshi)', checked: false, category: 'Money' },
    { id: 4, text: 'Powerbank (10,000–20,000 mAh)', checked: false, category: 'Tech' },
    { id: 5, text: 'Thermal Layers & Windbreaker (Assy & Shymbulak 0°C)', checked: false, category: 'Clothing' },
    { id: 6, text: 'Soft Duffel Bags (1 per person — no hard suitcases)', checked: true, category: 'Luggage' },
    { id: 7, text: 'Offline Maps: 2GIS & Yandex Maps downloaded', checked: false, category: 'Tech' },
    { id: 8, text: '2L Water bottle per person + Dry Snacks/Nuts', checked: false, category: 'Food' },
    { id: 9, text: 'Rubber slippers & small towel (Arasan Baths)', checked: false, category: 'Personal' },
    { id: 10, text: 'Sunscreen SPF50 & Sunglasses (Charyn & Dunes)', checked: false, category: 'Personal' },
    { id: 11, text: 'First Aid Kit + altitude sickness tablets', checked: false, category: 'Health' },
    { id: 12, text: 'Travel Insurance documents (print + digital)', checked: false, category: 'Docs' },
  ]);

  // ── Auto-detect trip day & current time ──────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const isOnTrip = now >= DEPARTURE && now <= TRIP_END;
    if (isOnTrip) {
      const dayNum = Math.floor((now.getTime() - new Date('2026-09-11T00:00:00+06:00').getTime()) / 86400000) + 1;
      if (dayNum >= 1 && dayNum <= 8) setSelectedDay(dayNum);
    }
  }, []);

  // ── Countdown ────────────────────────────────────────────────────────────────
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

  // ── Weather ──────────────────────────────────────────────────────────────────
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

  // ── Auto-scroll day selector to selected day ──────────────────────────────────
  useEffect(() => {
    const el = dayScrollRef.current?.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedDay]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const currentDayData = ITINERARY_DATA.find(d => d.day === selectedDay)!;
  const totalTripKZT = useMemo(() => ITINERARY_DATA.reduce((acc, day) => acc + day.activities.reduce((a, act) => a + act.kztExpense, 0), 0), []);
  const maxDayKZT = useMemo(() => Math.max(...ITINERARY_DATA.map(day => day.activities.reduce((a, act) => a + act.kztExpense, 0))), []);
  const totalPerPersonUSD = Math.round(totalTripKZT * EXCHANGE_RATES.USD);
  const currentDayTotal = currentDayData.activities.reduce((s, a) => s + a.kztExpense, 0);
  const budgetPercent = Math.round((currentDayTotal / maxDayKZT) * 100);

  const nowMins = nowMinutes();
  const isToday = (() => {
    const now = new Date();
    return now >= DEPARTURE && now <= TRIP_END;
  })();

  const filteredActivities = currentDayData.activities.filter(act => categoryFilter === 'all' || act.category === categoryFilter);

  // Current/next activity indices for "NOW" / "NEXT"
  const nowIdx = filteredActivities.findIndex(act => {
    const r = parseTimeRange(act.time);
    return r && nowMins >= r.start && nowMins <= r.end;
  });
  const nextIdx = nowIdx >= 0 ? nowIdx + 1 : filteredActivities.findIndex(act => {
    const r = parseTimeRange(act.time);
    return r && nowMins < r.start;
  });

  const dm = isDarkMode;
  const card = `${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
  const surface = `${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`;

  // ── Speech ───────────────────────────────────────────────────────────────────
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      window.speechSynthesis.speak(u);
    }
  };

  const handlePrint = () => { if (typeof window !== 'undefined') window.print(); };
  const toggleChecklist = (id: number) => setPackingItems(items => items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));

  // ── Bottom nav tabs (mobile) ──────────────────────────────────────────────────
  const mobileNavTabs = [
    { id: 'itinerary', label: 'Today',   icon: Calendar  },
    { id: 'map',       label: 'Map',     icon: Map       },
    { id: 'weather',   label: 'Weather', icon: Sun       },
    { id: 'phrases',   label: 'Phrases', icon: BookOpen  },
    { id: 'more',      label: 'More',    icon: MoreHorizontal },
  ];

  // ── Desktop tabs ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${dm ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-200 font-sans`}>

      {/* ── PRINT LAYOUT ── */}
      <div className="hidden print:block p-6">
        <h1 className="text-2xl font-bold mb-1">Kazakhstan 8-Day Master Itinerary</h1>
        <p className="text-sm text-gray-500 mb-6">6 Travelers • Sep 11–18, 2026</p>
        {ITINERARY_DATA.map(day => (
          <div key={day.day} className="print-card mb-4">
            <h2 className="font-bold text-sm border-b pb-1 mb-2">Day {day.day} — {day.date}: {day.title}</h2>
            <p className="text-xs text-gray-500 mb-2">📍 {day.location} | 🏠 {day.overnight}</p>
            {day.activities.map((act, i) => (
              <div key={i} className="mb-2 pl-2 border-l-2 border-gray-300">
                <p className="text-xs font-bold">{act.time} — {act.place} <span className="font-normal text-gray-500">({act.kztExpense.toLocaleString()} KZT)</span></p>
                <p className="text-xs">{act.whatToDo}</p>
                {act.lookOutFor && <p className="text-xs text-orange-700">⚠ {act.lookOutFor}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ══════════════ HEADER ══════════════ */}
      <header className={`no-print sticky top-0 z-40 border-b backdrop-blur-md ${dm ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">

          {/* Logo + title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-emerald-500/20 p-1.5 rounded-xl border border-emerald-500/40 text-emerald-400 shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent truncate">
                Kazakhstan Trip 🇰🇿
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:flex items-center gap-1">
                <Users className="w-3 h-3" /> 6 Travelers • Sep 11–18
              </p>
            </div>
          </div>

          {/* Right side: countdown + controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Countdown pill */}
            <div className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 ${dm ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
              <Timer className="w-3 h-3 text-emerald-400 shrink-0" />
              {countdown.tripOver ? (
                <span className="font-bold text-emerald-400">Trip done ✓</span>
              ) : countdown.departed ? (
                <span className="font-bold text-emerald-400">✈️ Underway!</span>
              ) : (
                <span className="font-mono font-bold text-emerald-400">
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m
                </span>
              )}
            </div>

            {/* Print (desktop only) */}
            <button onClick={handlePrint} className={`hidden sm:flex p-2 rounded-lg border items-center gap-1 text-xs ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'}`} title="Print">
              <Printer className="w-4 h-4" />
            </button>

            {/* Dark mode */}
            <button onClick={() => setIsDarkMode(!dm)} className={`p-2 rounded-lg border ${dm ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}>
              {dm ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop tab bar (hidden on mobile) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 space-x-1 overflow-x-auto text-xs font-medium scrollbar-none border-t border-slate-800/50">
          {desktopTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${isActive ? 'border-emerald-400 text-emerald-400 font-semibold bg-emerald-500/10' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}>
                <Icon className="w-3.5 h-3.5" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      {/* Bottom nav clearance: pb-24 on mobile, pb-6 on desktop */}
      <main className="no-print max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-28 md:pb-8">

        {/* ══════════ ITINERARY ══════════ */}
        {activeTab === 'itinerary' && (
          <div className="space-y-4">

            {/* On-trip banner */}
            {isToday && (
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${dm ? 'bg-emerald-900/30 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'}`}>
                <span className="text-xl shrink-0">📍</span>
                <div>
                  <div className="text-xs font-bold text-emerald-400">YOU ARE ON THE TRIP RIGHT NOW</div>
                  <div className="text-[11px] text-slate-400">Auto-selected today. Activities happening now are highlighted below.</div>
                </div>
              </div>
            )}

            {/* Day selector — horizontal scroll */}
            <div ref={dayScrollRef} className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-3 px-3">
              {ITINERARY_DATA.map(day => {
                const isSel = selectedDay === day.day;
                const dayTotal = day.activities.reduce((s, a) => s + a.kztExpense, 0);
                const pct = Math.round((dayTotal / maxDayKZT) * 100);
                const isThisToday = isToday && (() => {
                  const tripStartDate = new Date('2026-09-11');
                  const todayOffset = Math.floor((new Date().getTime() - tripStartDate.getTime()) / 86400000) + 1;
                  return day.day === todayOffset;
                })();
                return (
                  <button key={day.day} data-day={day.day} onClick={() => setSelectedDay(day.day)}
                    className={`flex-shrink-0 p-2.5 rounded-xl border text-left transition-all w-[90px] sm:w-[100px] relative ${
                      isSel
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-900/30'
                        : `${dm ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`
                    }`}>
                    {isThisToday && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 now-pulse" />}
                    <div className="text-[9px] uppercase font-bold tracking-wider opacity-75">{day.date}</div>
                    <div className="text-sm font-extrabold mt-0.5">Day {day.day}</div>
                    <div className="text-[10px] truncate mt-0.5 opacity-80 leading-tight">{day.title.split(' ').slice(0, 3).join(' ')}</div>
                    <div className="mt-1.5 h-1 rounded-full bg-white/20 overflow-hidden">
                      <div className={`h-1 rounded-full ${isSel ? 'bg-white' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Day header card */}
            <div className={`p-4 rounded-2xl border ${card}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Day {currentDayData.day} • {currentDayData.date}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mt-0.5 leading-tight">{currentDayData.title}</h2>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" /> {currentDayData.location}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Luggage className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-medium">{currentDayData.overnight}</span>
                  </p>
                </div>
                {/* Day budget bubble */}
                <div className={`shrink-0 text-center p-2.5 rounded-xl border ${dm ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="text-[9px] text-amber-400 font-bold uppercase">Day spend</div>
                  <div className="text-sm font-extrabold text-amber-300 font-mono">{(currentDayTotal / 1000).toFixed(0)}K</div>
                  <div className="text-[9px] text-slate-400">KZT/person</div>
                </div>
              </div>

              {/* Budget bar */}
              <div className="mt-3">
                <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className={`h-2 rounded-full transition-all duration-700 ${budgetPercent >= 90 ? 'bg-rose-500' : budgetPercent >= 65 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${budgetPercent}%` }} />
                </div>
              </div>

              {/* Category filter — pill style */}
              <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none">
                {['all', 'sightseeing', 'food', 'transit', 'hotel'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                      categoryFilter === cat
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                        : `${dm ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-300 text-slate-500'}`
                    }`}>
                    {cat === 'all' ? 'All' : `${CATEGORY_EMOJI[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities — collapsible cards */}
            <div className="space-y-2">
              {filteredActivities.map((act, idx) => {
                const isNow = isToday && idx === nowIdx;
                const isNext = isToday && idx === nextIdx && nowIdx !== -1;
                const isExpanded = expandedActivity === idx;
                const timeRange = parseTimeRange(act.time);

                return (
                  <div key={idx}
                    className={`rounded-2xl border transition-all ${
                      isNow
                        ? `${dm ? 'bg-emerald-950/40 border-emerald-600/60' : 'bg-emerald-50 border-emerald-300'} now-pulse`
                        : isNext
                        ? `${dm ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-50 border-slate-300'}`
                        : `${card}`
                    }`}>

                    {/* ── Collapsed header (always visible) ── */}
                    <button
                      className="w-full p-3.5 text-left"
                      onClick={() => setExpandedActivity(isExpanded ? null : idx)}>
                      <div className="flex items-start gap-2.5">
                        {/* Time column */}
                        <div className="shrink-0 text-center min-w-[58px]">
                          <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${dm ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                            {act.time.split(' - ')[0]}
                          </div>
                          {act.time.split(' - ')[1] && (
                            <div className="text-[9px] text-slate-500 mt-0.5">{act.time.split(' - ')[1]}</div>
                          )}
                        </div>

                        {/* Place + tags */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isNow && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-extrabold uppercase tracking-wide shrink-0">
                                <Zap className="w-2.5 h-2.5" /> NOW
                              </span>
                            )}
                            {isNext && !isNow && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wide shrink-0">
                                NEXT
                              </span>
                            )}
                            <span className="font-bold text-sm leading-tight truncate">{act.place}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400">{CATEGORY_EMOJI[act.category]} {act.category}</span>
                            {act.kztExpense > 0 && (
                              <span className="text-[10px] font-mono text-amber-400 font-bold">~{act.kztExpense >= 1000 ? `${(act.kztExpense/1000).toFixed(0)}K` : act.kztExpense} KZT</span>
                            )}
                          </div>
                        </div>

                        {/* Expand chevron */}
                        <div className={`shrink-0 mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Quick "what to do" preview (always visible) */}
                      {!isExpanded && (
                        <p className="text-[11px] text-slate-400 mt-2 ml-[70px] leading-relaxed line-clamp-2">{act.whatToDo}</p>
                      )}
                    </button>

                    {/* ── Expanded detail ── */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 space-y-3 border-t border-slate-800/40 pt-3">
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${dm ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            <Compass className="w-3 h-3" /> What to Do
                          </div>
                          <p className="text-xs leading-relaxed text-slate-200">{act.whatToDo}</p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 text-emerald-400">
                            <Coffee className="w-3 h-3" /> Must Try
                          </div>
                          <p className="text-xs leading-relaxed text-slate-200">{act.mustTry}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${dm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 text-amber-400">
                            <ShieldAlert className="w-3 h-3" /> Look Out For
                          </div>
                          <p className="text-xs leading-relaxed text-amber-200/90">{act.lookOutFor}</p>
                        </div>
                        {act.kztExpense > 0 && (
                          <div className="text-[11px] text-right font-mono">
                            <span className="text-slate-400">Est. cost: </span>
                            <span className="text-amber-400 font-bold">{act.kztExpense.toLocaleString()} KZT</span>
                            <span className="text-slate-500"> (${Math.round(act.kztExpense * EXCHANGE_RATES.USD)} USD)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ LIVE WEATHER ══════════ */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold flex items-center gap-2 text-cyan-400">
                  <Sun className="w-5 h-5" /> Live Weather
                </h2>
                <button onClick={fetchWeather} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 active:bg-cyan-500/30">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">Open-Meteo API • Free • No API key</p>

              <div className="grid grid-cols-2 gap-3">
                {weatherData.map((w, i) => {
                  const wInfo = weatherCodeInfo(w.weatherCode);
                  const locInfo = WEATHER_LOCATIONS[i];
                  return (
                    <div key={w.location} className={`p-3.5 rounded-2xl border ${surface}`}>
                      <div className="text-[9px] uppercase font-bold tracking-wider text-cyan-400 mb-0.5">{locInfo.desc}</div>
                      <div className="font-bold text-sm">{w.location}</div>
                      {w.loading ? (
                        <div className="mt-2 space-y-1.5 animate-pulse">
                          <div className="h-6 w-14 bg-slate-700 rounded" />
                          <div className="h-3 w-20 bg-slate-700 rounded" />
                        </div>
                      ) : w.error ? (
                        <p className="mt-1 text-[10px] text-rose-400">{w.error}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-2xl">{wInfo.emoji}</span>
                            <div>
                              <div className="text-xl font-extrabold leading-none">{w.temp}°C</div>
                              <div className="text-[10px] text-slate-400">{wInfo.label}</div>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                            <div className="flex flex-col items-center">
                              <Thermometer className="w-3 h-3 text-orange-400 mb-0.5" />
                              <span className="font-bold">{w.tempMax}°</span>
                              <span className="text-slate-500">{w.tempMin}°</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <Wind className="w-3 h-3 text-blue-400 mb-0.5" />
                              <span className="font-bold">{w.windSpeed}</span>
                              <span className="text-slate-500">km/h</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <Droplets className="w-3 h-3 text-cyan-400 mb-0.5" />
                              <span className="font-bold">{w.humidity}%</span>
                              <span className="text-slate-500">hum.</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* September tips */}
            <div className={`p-4 rounded-2xl border ${dm ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
              <p className="font-semibold text-amber-400 flex items-center gap-1.5 mb-2 text-sm">
                <AlertTriangle className="w-4 h-4" /> September Weather Guide
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                {[
                  { place: 'Almaty city', tip: '18–25°C days, 10–14°C evenings. Light jacket after 7pm.' },
                  { place: 'Shymbulak 3200m', tip: '0–8°C even in September. Thermal layer mandatory.' },
                  { place: 'Charyn Canyon', tip: 'Up to 30°C midday. Start early, carry 2L water each.' },
                  { place: 'Saty/Kolsai', tip: '10–18°C days, sub-5°C nights. Windbreaker essential.' },
                  { place: 'Altyn Emel dunes', tip: '20–28°C. Dusty winds common in afternoon.' },
                ].map(({ place, tip }) => (
                  <div key={place} className={`p-2 rounded-lg ${dm ? 'bg-slate-800/50' : 'bg-white'} border ${dm ? 'border-slate-700' : 'border-amber-100'}`}>
                    <span className="font-bold text-amber-300">{place}:</span>{' '}
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ MAP ══════════ */}
        {activeTab === 'map' && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400">
                <Map className="w-5 h-5" /> Interactive Trip Map
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Tap markers for details. Dashed line = road trip route.</p>
            </div>
            <MapTab isDarkMode={dm} />
          </div>
        )}

        {/* ══════════ PHRASEBOOK ══════════ */}
        {activeTab === 'phrases' && (
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border ${card}`}>
              <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400 mb-1">
                <BookOpen className="w-5 h-5" /> Russian Phrasebook
              </h2>
              <p className="text-[11px] text-slate-400 mb-3">Tap 🔊 to hear pronunciation aloud</p>

              {/* Category filter */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
                {['all', 'Greetings', 'Taxi', 'Shopping', 'Emergency'].map(cat => (
                  <button key={cat} onClick={() => setPhraseFilter(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                      phraseFilter === cat
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                        : `${dm ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`
                    }`}>
                    {cat === 'Emergency' ? '🚨 ' + cat : cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {PHRASES.filter(p => phraseFilter === 'all' || p.cat === phraseFilter).map((p, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border flex items-center gap-3 ${surface}`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{p.cat}</div>
                      <div className="text-sm font-bold mt-0.5 leading-tight">{p.mean}</div>
                      <div className="text-xs text-cyan-300 mt-0.5 font-medium">{p.ru}</div>
                      <div className="text-[10px] text-slate-400 italic mt-0.5">&quot;{p.trans}&quot;</div>
                    </div>
                    <button onClick={() => speakText(p.ru)}
                      className="shrink-0 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 active:bg-emerald-500 active:text-slate-950 border border-emerald-500/30 transition-colors">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ MORE (mobile hub) ══════════ */}
        {activeTab === 'more' && (
          <div className="space-y-4">
            {/* Section grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'currency',   label: 'Currency & Budget',   icon: DollarSign,  color: 'emerald', desc: 'KZT converter + 8-day budget' },
                { id: 'transport',  label: 'Car & Luggage',        icon: Car,         color: 'cyan',    desc: 'Vehicle options + cost calc' },
                { id: 'navigation', label: 'Routes & Times',       icon: Navigation,  color: 'amber',   desc: 'Distance matrix for all legs' },
                { id: 'checklist',  label: 'Packing Checklist',    icon: CheckSquare, color: 'violet',  desc: `${packingItems.filter(i => i.checked).length}/${packingItems.length} items packed` },
                { id: 'weather',    label: 'Live Weather',         icon: Sun,         color: 'sky',     desc: 'Real-time for all 4 stops' },
                { id: 'map',        label: 'Interactive Map',      icon: Map,         color: 'teal',    desc: '11 markers + route line' },
              ].map(sec => {
                const Icon = sec.icon;
                return (
                  <button key={sec.id} onClick={() => setActiveTab(sec.id)}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-95 ${surface}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 bg-${sec.color}-500/15 border border-${sec.color}-500/30`}>
                      <Icon className={`w-5 h-5 text-${sec.color}-400`} />
                    </div>
                    <div className="font-bold text-sm leading-tight">{sec.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sec.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Quick currency converter */}
            <div className={`p-4 rounded-2xl border ${card}`}>
              <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Quick KZT Converter
              </h3>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input type="number" value={kztAmount} onChange={e => setKztAmount(Number(e.target.value))}
                    className={`w-full p-3 rounded-xl border text-base font-mono font-bold ${dm ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-bold">KZT</span>
                </div>
                <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)}
                  className={`p-3 rounded-xl border text-sm font-bold ${dm ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                  <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                </select>
              </div>
              <div className={`mt-2 p-3 rounded-xl border text-center ${dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-xl font-extrabold text-emerald-300 font-mono">
                  {(kztAmount * EXCHANGE_RATES[selectedCurrency]).toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">1 {selectedCurrency} ≈ {Math.round(1 / EXCHANGE_RATES[selectedCurrency])} KZT</div>
              </div>
            </div>

            {/* Print button */}
            <button onClick={handlePrint}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${surface} active:scale-95`}>
              <Printer className="w-4 h-4 text-slate-400" /> Print Full Itinerary (All 8 Days)
            </button>
          </div>
        )}

        {/* ══════════ CURRENCY (full page, reached from desktop or More→) ══════════ */}
        {activeTab === 'currency' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${card}`}>
              <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400 mb-1">
                <DollarSign className="w-5 h-5" /> Currency & Budget
              </h2>
              <p className="text-[10px] text-slate-500">Static rates (Sep 2026): 1 USD ≈ 475 KZT</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block font-semibold">Amount (KZT)</label>
                  <div className="relative">
                    <input type="number" value={kztAmount} onChange={e => setKztAmount(Number(e.target.value))}
                      className={`w-full p-3 rounded-xl border text-lg font-mono font-bold ${dm ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-bold">KZT</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block font-semibold">Currency</label>
                  <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-base font-bold ${dm ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
                <div className={`p-3 rounded-xl border flex flex-col justify-center ${dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">Result</div>
                  <div className="text-xl font-extrabold text-emerald-300 font-mono mt-0.5">
                    {(kztAmount * EXCHANGE_RATES[selectedCurrency]).toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily budget bars */}
            <div className={`p-4 rounded-2xl border ${card}`}>
              <h3 className="font-bold text-sm mb-3">Daily Spend — All 8 Days</h3>
              <div className="space-y-2.5">
                {ITINERARY_DATA.map(day => {
                  const total = day.activities.reduce((s, a) => s + a.kztExpense, 0);
                  const pct = Math.round((total / maxDayKZT) * 100);
                  return (
                    <div key={day.day}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium">Day {day.day} <span className="text-slate-400 hidden sm:inline">— {day.title.slice(0, 28)}{day.title.length > 28 ? '…' : ''}</span></span>
                        <span className="font-mono font-bold text-emerald-400">{(total/1000).toFixed(0)}K KZT</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div className={`h-2 rounded-full ${pct >= 90 ? 'bg-rose-500' : pct >= 65 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                {[
                  { label: 'Total / person', value: `~${totalTripKZT.toLocaleString()} KZT`, sub: `$${totalPerPersonUSD} USD`, color: 'emerald' },
                  { label: 'Total × 6', value: `~${(totalTripKZT * 6).toLocaleString()} KZT`, sub: `$${totalPerPersonUSD * 6} USD`, color: 'cyan' },
                  { label: 'Cash needed', value: '~200,000 KZT', sub: 'Saty/Basshi', color: 'amber' },
                  { label: 'Cable cars/fees', value: '~20K KZT', sub: 'Per person', color: 'teal' },
                ].map(stat => (
                  <div key={stat.label} className={`p-3 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[9px] text-slate-400 uppercase">{stat.label}</div>
                    <div className={`text-sm font-bold text-${stat.color}-400 mt-0.5`}>{stat.value}</div>
                    <div className="text-[9px] text-slate-500">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TRANSPORT ══════════ */}
        {activeTab === 'transport' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${card}`}>
              <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400 mb-3">
                <Car className="w-5 h-5" /> 6-Person Transport Strategy
              </h2>
              <div className="space-y-2">
                {[
                  { id: 'minivan', title: 'Option A: Full Minivan', models: 'Kia Carnival / Hyundai Staria', dailyRate: 75000, pros: 'Fits 6 + luggage; one driver', cons: 'Lower clearance' },
                  { id: '2crossovers', title: 'Option B: 2 Crossovers', models: '2× Hyundai Tucson / Geely', dailyRate: 60000, pros: 'High clearance; total flexibility', cons: '2 drivers with IDP + 2 deposits' },
                  { id: 'driver', title: 'Option C: Private Driver', models: 'Toyota HiAce / Sprinter', dailyRate: 100000, pros: 'Zero liability; driver handles roads', cons: 'Higher cost; less privacy' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setStrategyType(opt.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${strategyType === opt.id ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-500/20' : `${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{opt.title}</span>
                      {strategyType === opt.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">~{opt.dailyRate.toLocaleString()} KZT/day • 3 days = {(opt.dailyRate * 3).toLocaleString()} KZT total</div>
                    <div className="text-[10px] text-slate-400 mt-1">{opt.models}</div>
                    <div className="mt-2 text-[10px] space-y-0.5">
                      <p className="text-emerald-300">✓ {opt.pros}</p>
                      <p className="text-rose-300">✕ {opt.cons}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className={`mt-3 p-3 rounded-xl border ${dm ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'} flex justify-between items-center text-xs font-mono`}>
                <div>
                  <div className="text-slate-400 text-[10px]">TOTAL RENTAL (3 DAYS)</div>
                  <div className="text-base font-bold text-emerald-400">~{((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * 3).toLocaleString()} KZT</div>
                </div>
                <div className="border-l border-slate-700 h-8 mx-3" />
                <div>
                  <div className="text-slate-400 text-[10px]">PER PERSON</div>
                  <div className="text-base font-bold text-cyan-400">~{Math.round(((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * 3) / 6).toLocaleString()} KZT</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Roof Rack Safety', icon: AlertTriangle, color: 'amber', items: ['Must Have Crossbars — never tie directly to roof', 'Use IPX Cargo Bags or Hard Roof Box (dust storms!)', 'Weight limit: 50–70 kg max to avoid instability'] },
                { title: 'Luggage Strategy', icon: Luggage, color: 'emerald', items: ['Leave main suitcases at Almaty hotel on Day 5', 'Take only 1 soft duffel per person to guesthouses', 'Re-pack at Almaty on Day 8 before flight'] },
              ].map(sec => {
                const Icon = sec.icon;
                return (
                  <div key={sec.title} className={`p-4 rounded-2xl border ${card}`}>
                    <h3 className={`font-bold text-sm text-${sec.color}-400 flex items-center gap-2 mb-2`}>
                      <Icon className="w-4 h-4" /> {sec.title}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {sec.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5"><span className="text-emerald-400 mt-0.5 shrink-0">•</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ NAVIGATION / ROUTES ══════════ */}
        {activeTab === 'navigation' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${card}`}>
              <h2 className="text-base font-bold flex items-center gap-2 text-cyan-400 mb-3">
                <Navigation className="w-5 h-5" /> Navigation Apps
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Yandex Maps / Go', badge: 'Essential', color: 'yellow', desc: 'City taxi (XL for 6 people) + offline Almaty region map download' },
                  { name: '2GIS (Dva GIS)', badge: 'City Precise', color: 'emerald', desc: 'Bus 12 to Medeu, building entrances, offline pedestrian paths' },
                ].map(app => (
                  <div key={app.name} className={`p-3.5 rounded-xl border ${surface}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm text-${app.color}-400`}>{app.name}</span>
                      <span className={`text-[9px] bg-${app.color}-400/20 text-${app.color}-300 px-1.5 py-0.5 rounded border border-${app.color}-400/30`}>{app.badge}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5">{app.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${card}`}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" /> Distance & Travel Time
              </h3>
              <div className="space-y-2">
                {ROUTE_LEGS.map((leg, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${surface}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{leg.from} → <span className="text-emerald-400">{leg.to}</span></div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{leg.road}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-mono font-bold text-amber-300">{leg.time}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{leg.dist}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ CHECKLIST ══════════ */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${card}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400">
                  <CheckSquare className="w-5 h-5" /> Packing Checklist
                </h2>
                <span className="text-xs font-bold text-emerald-400">{packingItems.filter(i => i.checked).length}/{packingItems.length}</span>
              </div>
              <div className={`h-2.5 rounded-full overflow-hidden mb-4 ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round((packingItems.filter(i => i.checked).length / packingItems.length) * 100)}%` }} />
              </div>
              <div className="space-y-2">
                {packingItems.map(item => (
                  <div key={item.id} onClick={() => toggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                      item.checked
                        ? `${dm ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'}`
                        : `${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`
                    }`}>
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600'}`}>
                      {item.checked && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium leading-tight ${item.checked ? 'line-through opacity-50' : ''}`}>{item.text}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${dm ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-slate-200 text-slate-500'}`}>
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency contacts */}
            <div className={`p-4 rounded-2xl border ${dm ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50 border-rose-200'}`}>
              <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2 mb-3">
                <PhoneCall className="w-4 h-4" /> Emergency Contacts — Kazakhstan
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'RESCUE / FIRE', number: '101 / 112' },
                  { label: 'POLICE', number: '102' },
                  { label: 'AMBULANCE', number: '103' },
                  { label: 'ALMATY AIRPORT', number: '+7 727 270 3333' },
                ].map(e => (
                  <a key={e.label} href={`tel:${e.number.replace(/[^+\d]/g, '')}`}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 block active:scale-95 transition-transform">
                    <div className="text-[9px] text-slate-400 uppercase">{e.label}</div>
                    <div className="font-bold text-rose-300 text-sm font-mono mt-0.5">{e.number}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ══════════════ MOBILE BOTTOM NAV ══════════════ */}
      <nav className={`no-print md:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${dm ? 'bg-slate-900/98 border-slate-800' : 'bg-white/98 border-slate-200'} backdrop-blur-md pb-safe`}>
        <div className="flex items-center justify-around py-1.5">
          {mobileNavTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'more' && !mobileNavTabs.slice(0, 4).some(t => t.id === activeTab));
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all min-w-[56px] ${
                  isActive
                    ? 'text-emerald-400'
                    : `${dm ? 'text-slate-500 active:text-slate-300' : 'text-slate-400 active:text-slate-700'}`
                }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ══════════════ FLOATING EMERGENCY BUTTON ══════════════ */}
      <button
        onClick={() => setShowEmergency(true)}
        className="no-print fixed bottom-20 md:bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-900/50 flex items-center justify-center border-2 border-rose-400 active:scale-90 transition-transform"
        title="Emergency Contacts"
      >
        <PhoneCall className="w-5 h-5" />
      </button>

      {/* ══════════════ EMERGENCY MODAL ══════════════ */}
      {showEmergency && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowEmergency(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-sm rounded-2xl border p-5 ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-2xl`}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-rose-400 flex items-center gap-2">
                <PhoneCall className="w-5 h-5" /> Emergency Contacts
              </h3>
              <button onClick={() => setShowEmergency(false)} className={`p-1.5 rounded-lg ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'RESCUE / FIRE', number: '101', dialNum: '101' },
                { label: 'POLICE', number: '102', dialNum: '102' },
                { label: 'AMBULANCE', number: '103', dialNum: '103' },
                { label: 'UNIVERSAL', number: '112', dialNum: '112' },
              ].map(e => (
                <a key={e.label} href={`tel:${e.dialNum}`}
                  className="p-3.5 rounded-xl bg-rose-900/20 border border-rose-800/50 text-center active:scale-95 transition-transform block">
                  <div className="text-[9px] text-slate-400 uppercase mb-0.5">{e.label}</div>
                  <div className="font-extrabold text-rose-300 text-2xl font-mono">{e.number}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Tap to call</div>
                </a>
              ))}
            </div>
            <a href="tel:+77272703333"
              className="mt-3 w-full p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between active:scale-95 transition-transform block">
              <div>
                <div className="text-[9px] text-slate-400 uppercase">ALMATY AIRPORT</div>
                <div className="font-bold text-rose-300 font-mono">+7 727 270 3333</div>
              </div>
              <PhoneCall className="w-4 h-4 text-rose-400" />
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
