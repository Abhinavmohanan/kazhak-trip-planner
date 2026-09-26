'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar, MapPin, Compass, Car, Luggage, DollarSign, BookOpen,
  CheckSquare, Volume2, ShieldAlert, PhoneCall, ArrowRight,
  ChevronDown, ChevronUp, Sun, Moon, AlertTriangle, Navigation, Clock,
  Users, Fuel, Info, Check, RefreshCw, Calculator, Coffee, ShoppingBag,
  Printer, CloudRain, Wind, Thermometer, Droplets, Map, Timer,
} from 'lucide-react';

// ─── Dynamic Leaflet Map (no SSR) ─────────────────────────────────────────────
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

// ─── Static Data ──────────────────────────────────────────────────────────────
const ITINERARY_DATA: DayData[] = [
  {
    day: 1,
    date: 'Sun, Sep 11',
    title: 'Arrival & Almaty City Culture',
    overnight: 'Almaty City Hotel (Base 1)',
    location: 'Almaty City',
    activities: [
      { time: '09:50 - 12:30', place: 'Almaty Airport (ALA)', whatToDo: 'Immigration, baggage claim, buy local Beeline/Tele2 SIM, order Yandex XL Taxi to hotel.', mustTry: 'Local SIM card setup at arrivals', lookOutFor: 'Ignore aggressive unlicensed airport taxi drivers; stick strictly to Yandex Go app', kztExpense: 4000, category: 'transit' },
      { time: '12:30 - 13:30', place: 'City Hotel', whatToDo: 'Hotel check-in or drop luggage in storage.', mustTry: 'Request early check-in or store bags', lookOutFor: 'Keep passports handy', kztExpense: 0, category: 'hotel' },
      { time: '13:30 - 15:00', place: 'Navat / Tandir Restaurant', whatToDo: 'Traditional Kazakh & Central Asian kick-off lunch.', mustTry: 'Boshu Lagman (hand-pulled noodles) & Manti', lookOutFor: 'Portion sizes are generous for sharing', kztExpense: 4500, category: 'food' },
      { time: '15:30 - 17:00', place: 'Green Bazaar (Zelyony Bazar)', whatToDo: 'Explore historic market stalls, spices, meats, and dried fruits.', mustTry: 'Kurt (salted cheese balls), local mountain honey, dried apricots', lookOutFor: 'Closed on Mondays! Cash only for stall vendors', kztExpense: 3000, category: 'sightseeing' },
      { time: '17:30 - 18:30', place: 'Panfilov Park & Zenkov Cathedral', whatToDo: 'Walk through leafy park and visit the famous 19th-century wooden cathedral built without nails.', mustTry: 'Intricate wooden architecture photo spots', lookOutFor: 'Modest dress code inside cathedral (men remove hats, women cover shoulders/heads)', kztExpense: 0, category: 'sightseeing' },
      { time: '18:30 - 20:00', place: 'Arbat (Zhibek Zholy) Pedestrian St', whatToDo: 'Evening promenade, street musicians, local art galleries, and coffee stops.', mustTry: 'Street performances & artisan crafts', lookOutFor: 'Watch out for cyclists on pedestrian paths', kztExpense: 1500, category: 'sightseeing' },
      { time: '20:00 - 22:00', place: 'City Center', whatToDo: 'Dinner & Craft drinks / Georgian feast.', mustTry: "Shashlik, Khachapuri or local craft beer at Harat's", lookOutFor: 'Card payments widely accepted in Almaty city', kztExpense: 6000, category: 'food' },
    ],
  },
  {
    day: 2,
    date: 'Mon, Sep 12',
    title: 'High Altitude Rink, Peaks & Sunset',
    overnight: 'Almaty City Hotel (Base 1)',
    location: 'Medeu & Shymbulak',
    activities: [
      { time: '09:00 - 10:00', place: 'Dostyk Ave Cafe', whatToDo: 'Breakfast and specialty coffee.', mustTry: 'Syrniki (cottage cheese pancakes) with berry jam', lookOutFor: 'Top up Onay bus card or keep contactless bank card ready', kztExpense: 3000, category: 'food' },
      { time: '10:00 - 11:30', place: 'Medeu Speed Skating Rink', whatToDo: 'Ride public Bus No. 12 from Dostyk Ave (~40 mins) to Medeu valley.', mustTry: 'Panoramas of highest ice rink in the world', lookOutFor: 'Bus can get crowded on pleasant mornings', kztExpense: 200, category: 'transit' },
      { time: '12:00 - 15:30', place: 'Shymbulak & Talgar Pass (3200m)', whatToDo: 'Ride 3-stage cable car up to Talgar Pass for high mountain peaks.', mustTry: 'Chalet dining at 3200 Cafe, crisp glacier air', lookOutFor: 'Temperatures are 10°C colder than city; wear extra thermal layer', kztExpense: 12000, category: 'sightseeing' },
      { time: '16:00 - 17:00', place: 'Return to City', whatToDo: 'Take bus or Yandex Taxi back down Dostyk Avenue.', mustTry: 'Rest legs on transit', lookOutFor: 'Afternoon traffic peaks around 17:30', kztExpense: 1000, category: 'transit' },
      { time: '17:00 - 19:30', place: 'Kok Tobe Hilltop', whatToDo: 'Aerial cable car from Dostyk Ave to Kok Tobe park for sunset over Almaty.', mustTry: 'Almaty Tower view & sunset photos', lookOutFor: 'Cable car ticket ~1,250 KZT roundtrip', kztExpense: 1250, category: 'sightseeing' },
      { time: '20:00 - 22:00', place: 'City Center', whatToDo: 'Dinner and drinks.', mustTry: 'Traditional Kazakh Beshbarmak noodle plate', lookOutFor: 'Hydrate well after altitude', kztExpense: 6500, category: 'food' },
    ],
  },
  {
    day: 3,
    date: 'Tue, Sep 13',
    title: 'Big Almaty Lake (BAO) & Arasan Baths',
    overnight: 'Almaty City Hotel (Base 1)',
    location: 'Big Almaty Lake & City',
    activities: [
      { time: '08:30 - 13:00', place: 'Big Almaty Lake (BAO)', whatToDo: 'Take Yandex Taxi to hydro-station barrier; walk final scenic section up to alpine reservoir.', mustTry: 'Turquoise mountain mirror lake reflections', lookOutFor: 'MANDATORY: Carry original passports (border patrol zone near Kyrgyzstan)', kztExpense: 4000, category: 'sightseeing' },
      { time: '13:00 - 15:00', place: 'Almarasan Gorge', whatToDo: 'Descend to riverside restaurants in Almarasan canyon.', mustTry: 'Freshly grilled mountain trout & lamb shashlik', lookOutFor: 'Check trout price per 100 grams before ordering', kztExpense: 6000, category: 'food' },
      { time: '16:00 - 18:30', place: 'Arasan Bathhouse', whatToDo: 'Historic Soviet/Kazakh public bathhouse recovery session.', mustTry: 'Venik (oak leaf bundle) sauna massage & cold plunge pool', lookOutFor: 'Gender-segregated nude complex; bring rubber slippers and towel', kztExpense: 3500, category: 'sightseeing' },
      { time: '19:30 - 21:30', place: 'City Center', whatToDo: 'Relaxed city dinner.', mustTry: 'Kazakh horse meat delicacies (Kazy) or Georgian wine', lookOutFor: 'Early night before early morning tour', kztExpense: 5500, category: 'food' },
    ],
  },
  {
    day: 4,
    date: 'Wed, Sep 14',
    title: 'Guided 1-Day Tour: Assy Plateau & Turgen',
    overnight: 'Almaty City Hotel (Base 1)',
    location: 'Assy Plateau & Turgen Gorge',
    activities: [
      { time: '08:00 - 11:30', place: 'Turgen Gorge', whatToDo: 'Board 4x4 tour vehicle from hotel; drive through Turgen mountain river gorge.', mustTry: 'Bear Waterfall walk', lookOutFor: 'Tour operator drives extreme riverbed off-road sections', kztExpense: 15000, category: 'sightseeing' },
      { time: '11:30 - 15:30', place: 'Assy Plateau & Soviet Observatory', whatToDo: 'Explore vast high-altitude steppe (2700m), rivers, nomads, and lone Soviet observatory dome.', mustTry: 'Nomadic yurt photo ops & outdoor group picnic', lookOutFor: 'Zero cellular network on plateau; pack thermal jacket', kztExpense: 0, category: 'sightseeing' },
      { time: '15:30 - 18:30', place: 'Return Drive to Almaty', whatToDo: 'Scenic descent back down Turgen valley to city.', mustTry: 'Mountain honey roadside stalls', lookOutFor: 'Keep camera ready for wild horse herds', kztExpense: 1000, category: 'transit' },
      { time: '19:00 - 21:30', place: 'Almaty City', whatToDo: 'Hotel drop-off; evening dinner in Almaty.', mustTry: 'Craft burger or Italian dinner at Parmigiano', lookOutFor: 'Rest well before 3-day road trip tomorrow', kztExpense: 5000, category: 'food' },
    ],
  },
  {
    day: 5,
    date: 'Thu, Sep 15',
    title: 'Car Rental Start → Charyn Canyon → Saty',
    overnight: 'Saty Village Guesthouse (Base 2)',
    location: 'Charyn & Saty',
    activities: [
      { time: '08:30 - 09:30', place: 'Almaty City', whatToDo: 'Pick up 3-day rental minivan/crossover. Leave main suitcases at Almaty hotel storage.', mustTry: 'Inspect rental vehicle tires, spare tire, & jack carefully', lookOutFor: 'Ensure driver has International Driving Permit (IDP)', kztExpense: 10000, category: 'transit' },
      { time: '09:30 - 13:30', place: 'Highway A3 / Baiseit Village', whatToDo: 'Drive ~200 km to Charyn Canyon entrance. Stop at Baiseit village market.', mustTry: 'Fresh hot Tandir Samsa at Baiseit roadside stall', lookOutFor: 'Observe speed limits (50 km/h in villages, traffic police enforce with radar)', kztExpense: 1000, category: 'transit' },
      { time: '13:30 - 16:30', place: 'Charyn Canyon (Valley of Castles)', whatToDo: 'Hike 2.5 km down dramatic red rock canyon gorge down to Charyn River.', mustTry: 'Eco-bus option back uphill if exhausted', lookOutFor: 'Intense midday heat; entry fee ~850 KZT/person; carry minimum 2L water', kztExpense: 850, category: 'sightseeing' },
      { time: '16:30 - 17:30', place: 'Black Canyon', whatToDo: '20-min photo stop directly along main highway overlook.', mustTry: 'Sheer vertical canyon cliff view down to rushing river', lookOutFor: 'No barrier edge; stay safe while taking photos', kztExpense: 0, category: 'sightseeing' },
      { time: '18:30 - 21:00', place: 'Saty Village', whatToDo: 'Arrive at Saty family guesthouse. Check-in and enjoy hearty homemade dinner.', mustTry: 'Baursak (fried dough), fresh sheep/cow cheese, hot mountain tea', lookOutFor: 'Cash only in Saty village (KZT); no ATM or card readers', kztExpense: 8000, category: 'hotel' },
    ],
  },
  {
    day: 6,
    date: 'Fri, Sep 16',
    title: 'Submerged Forest (Kaindy) & Kolsai Lakes',
    overnight: 'Saty Village Guesthouse (Base 2)',
    location: 'Kaindy & Kolsai Lakes',
    activities: [
      { time: '08:00 - 09:00', place: 'Saty Guesthouse', whatToDo: 'Guesthouse home breakfast.', mustTry: 'Fresh farm eggs, homemade berry jams', lookOutFor: 'Pack warm windbreaker jacket', kztExpense: 0, category: 'food' },
      { time: '09:00 - 13:00', place: 'Lake Kaindy', whatToDo: 'Hire local Soviet UAZ 4x4 Bukhanka van from Saty. Hike/horse ride to submerged birch tree forest lake.', mustTry: 'Spruce trees standing upright in turquoise water', lookOutFor: 'DO NOT drive rental car here (riverbed tracks break standard cars). Eco-fee ~850 KZT', kztExpense: 3500, category: 'sightseeing' },
      { time: '13:00 - 14:30', place: 'Saty Village', whatToDo: 'Return to village for hot guesthouse lunch.', mustTry: 'Traditional Lagman or Kuurdak', lookOutFor: 'Rest up before afternoon lake stroll', kztExpense: 3000, category: 'food' },
      { time: '15:00 - 18:30', place: 'Lower Kolsai Lake', whatToDo: 'Drive 20 mins on smooth asphalt road to Lower Kolsai Lake.', mustTry: 'Wooden rowboat rental on turquoise alpine lake', lookOutFor: 'Rowboat ~5000 KZT / 30 mins; late afternoon golden hour lighting', kztExpense: 3000, category: 'sightseeing' },
      { time: '19:30 - 21:30', place: 'Saty Village', whatToDo: 'Dinner and stargazing in guesthouse courtyard.', mustTry: 'Unpolluted mountain night sky views', lookOutFor: 'Night temps drop fast', kztExpense: 0, category: 'hotel' },
    ],
  },
  {
    day: 7,
    date: 'Sat, Sep 17',
    title: 'Drive to Altyn Emel (Singing Dunes)',
    overnight: 'Basshi Village Guesthouse (Base 3)',
    location: 'Altyn Emel National Park',
    activities: [
      { time: '07:00 - 11:30', place: 'Saty to Basshi', whatToDo: 'Early check-out & drive 250 km via Chilik and Kokpek pass to Basshi village.', mustTry: 'Scenic steppe landscapes', lookOutFor: 'Start early to avoid navigating unlit dirt tracks at night', kztExpense: 4000, category: 'transit' },
      { time: '12:00 - 13:00', place: 'Basshi Village Office', whatToDo: 'Register vehicle and pay entry tickets at Altyn Emel National Park headquarters.', mustTry: 'Local village lunch at Basshi', lookOutFor: 'Keep park permit receipt visible on car dashboard', kztExpense: 1500, category: 'transit' },
      { time: '13:30 - 17:00', place: 'Singing Dunes (Altyn Emel)', whatToDo: 'Drive 1-hour washboard gravel track to Singing Dunes. Climb dune ridge and slide down.', mustTry: 'Hear the loud organ-like hum produced by vibrating sand', lookOutFor: 'Cap driving speed at 40 km/h on gravel; wear sunglasses, hat, and sunscreen', kztExpense: 0, category: 'sightseeing' },
      { time: '18:00 - 21:00', place: 'Basshi Village', whatToDo: 'Check-in to local Basshi guesthouse. Dinner and rest.', mustTry: 'Homestyle Kazakh nomadic hospitality', lookOutFor: 'Cash for guesthouse stay', kztExpense: 8000, category: 'hotel' },
    ],
  },
  {
    day: 8,
    date: 'Sun, Sep 18',
    title: 'Return Almaty, Souvenirs & Airport Transit',
    overnight: 'Flight Departure',
    location: 'Almaty & Departure',
    activities: [
      { time: '07:30 - 11:30', place: 'Basshi to Almaty Highway', whatToDo: 'Drive 255 km back to Almaty via Qonaev (Kapchagay) toll highway.', mustTry: 'Lake Kapchagay view along highway', lookOutFor: 'Refuel at Qazaq Oil or Compass gas station near highway', kztExpense: 3000, category: 'transit' },
      { time: '12:00 - 12:30', place: 'Almaty City', whatToDo: 'Return rental car (clean interior, full fuel tank).', mustTry: 'Retrieve stored main suitcases from hotel', lookOutFor: 'Rental drop-off inspection', kztExpense: 0, category: 'transit' },
      { time: '12:30 - 14:00', place: 'Panfilov St Cafe', whatToDo: 'Lunch along pedestrian avenue.', mustTry: 'Craft coffee & Central Asian baked pastries', lookOutFor: 'Relaxed urban vibe', kztExpense: 4000, category: 'food' },
      { time: '14:00 - 16:00', place: 'Central State Museum', whatToDo: 'Explore Kazakh nomadic history and archaeological treasures.', mustTry: 'Golden Man (Altyn Adam) ancient warrior exhibit', lookOutFor: 'Museum ticket ~1,000 KZT', kztExpense: 1000, category: 'sightseeing' },
      { time: '16:00 - 17:30', place: 'Rakhat Chocolate Factory Store', whatToDo: 'Souvenir shopping at official factory outlet on Zenkov Street.', mustTry: 'Signature blue-wrapped "Kazakhstan" chocolate bars and tins', lookOutFor: 'Factory store offers best wholesale prices', kztExpense: 5000, category: 'sightseeing' },
      { time: '18:00 - 19:30', place: 'City Center', whatToDo: 'Final celebratory dinner in Almaty.', mustTry: 'Gosti or Kishlak farewell feast', lookOutFor: 'Allow 45 mins transit time to airport', kztExpense: 6000, category: 'food' },
      { time: '20:00 - 22:30', place: 'Almaty Airport (ALA)', whatToDo: 'Yandex XL Taxi to airport; check-in 3 hours prior to departure.', mustTry: 'Safe journey home!', lookOutFor: 'Ensure no liquids or souvenirs exceed hand baggage limits', kztExpense: 4000, category: 'transit' },
    ],
  },
];

const PHRASES = [
  { cat: 'Greetings & Basic', ru: 'Здравствуйте', kz: 'Сәлеметсіз бе', trans: 'Zdrav-stvuy-te', mean: 'Hello (Formal)' },
  { cat: 'Greetings & Basic', ru: 'Спасибо', kz: 'Рақмет', trans: 'Rakh-met / Spas-ee-ba', mean: 'Thank you' },
  { cat: 'Greetings & Basic', ru: 'Да / Нет', kz: 'Иә / Жоқ', trans: 'Da / Nyet', mean: 'Yes / No' },
  { cat: 'Greetings & Basic', ru: 'Пожалуйста', kz: 'Өтініш', trans: 'Pa-zhal-oo-sta', mean: 'Please / You are welcome' },
  { cat: 'Taxi & Directions', ru: 'Сколько стоит до...?', kz: '... дейін қанша тұрады?', trans: 'Skol-ko sto-it do...?', mean: 'How much to go to...?' },
  { cat: 'Taxi & Directions', ru: 'Остановите здесь', kz: 'Осы жерден тоқтаңыз', trans: 'Osta-nov-i-te zdes', mean: 'Stop here please' },
  { cat: 'Taxi & Directions', ru: 'Направо / Налево', kz: 'Оңға / Солға', trans: 'Na-pra-vo / Na-le-vo', mean: 'Turn right / Turn left' },
  { cat: 'Taxi & Directions', ru: 'Где находится...?', kz: '... қайда орналасқан?', trans: 'Gde na-kho-dit-sya...?', mean: 'Where is... located?' },
  { cat: 'Shopping & Dining', ru: 'Сколько это стоит?', kz: 'Бұл қанша тұрады?', trans: 'Skol-ko e-to sto-it?', mean: 'How much is this?' },
  { cat: 'Shopping & Dining', ru: 'Можно карту / наличные?', kz: 'Карта / қолма-қол ақша ма?', trans: 'Mozh-no kar-too / na-lich-ny-e?', mean: 'Card or Cash?' },
  { cat: 'Shopping & Dining', ru: 'Чек, пожалуйста', kz: 'Чек, өтініш', trans: 'Chek pa-zhal-oo-sta', mean: 'Bill/Receipt please' },
  { cat: 'Shopping & Dining', ru: 'Без мяса / Свинины', kz: 'Етсіз / Шошқа етінсіз', trans: 'Bez mya-sa / Svi-ni-ny', mean: 'No meat / No pork' },
  { cat: 'Emergency & Helpful', ru: 'Помогите!', kz: 'Көмектесіңізші!', trans: 'Po-mo-gi-te!', mean: 'Help me!' },
  { cat: 'Emergency & Helpful', ru: 'Где туалет?', kz: 'Әжетхана қайда?', trans: 'Gde too-a-let?', mean: 'Where is the bathroom?' },
  { cat: 'Emergency & Helpful', ru: 'Вы говорите по-английски?', kz: 'Ағылшынша сөйлейсіз бе?', trans: 'Vy go-vo-ri-te po ang-liys-ki?', mean: 'Do you speak English?' },
  { cat: 'Emergency & Helpful', ru: 'Мне нужен врач', kz: 'Маған дәрігер керек', trans: 'Mne noo-zhen vrach', mean: 'I need a doctor' },
];

const ROUTE_LEGS = [
  { from: 'Almaty City', to: 'Medeu Rink', dist: '18 km', time: '35-45 mins', road: 'Paved City Mountain Road (Bus 12 / Yandex)' },
  { from: 'Almaty City', to: 'Big Almaty Lake (BAO)', dist: '28 km', time: '1 hr drive + 1.5 hr hike', road: 'Paved up to Hydro Barrier, then walk' },
  { from: 'Almaty City', to: 'Assy Plateau', dist: '100 km', time: '3.5 - 4 hours', road: 'Paved to Turgen, then steep dirt/riverbed 4x4 track' },
  { from: 'Almaty City', to: 'Charyn Canyon', dist: '200 km', time: '3.5 - 4 hours', road: 'Paved Highway A3 + 10 km gravel access' },
  { from: 'Charyn Canyon', to: 'Saty Village', dist: '85 km', time: '1.5 hours', road: 'Paved Regional Road (passes Black Canyon)' },
  { from: 'Saty Village', to: 'Lake Kaindy Parking', dist: '15 km', time: '45 mins', road: 'Extreme Riverbed Mud/Ruts (Use local UAZ Van)' },
  { from: 'Saty Village', to: 'Lower Kolsai Lake', dist: '15 km', time: '20 mins', road: 'Smooth Paved Asphalt' },
  { from: 'Saty Village', to: 'Basshi (Altyn Emel)', dist: '250 km', time: '4.5 hours', road: 'Paved via Chilik & Kokpek pass' },
  { from: 'Basshi Village', to: 'Singing Dunes (Roundtrip)', dist: '90 km', time: '2 hours total drive', road: 'Washboard Gravel Track (Max 40 km/h)' },
  { from: 'Basshi Village', to: 'Almaty City', dist: '255 km', time: '3.5 - 4 hours', road: 'Paved Highway A3 via Qonaev Tollroad' },
];

// ─── Weather locations for Open-Meteo API ─────────────────────────────────────
const WEATHER_LOCATIONS = [
  { name: 'Almaty', lat: 43.222, lon: 76.8512, desc: 'City base (Days 1–4, 8)' },
  { name: 'Charyn Canyon', lat: 43.35, lon: 79.067, desc: 'Desert canyon (Day 5)' },
  { name: 'Saty / Kolsai', lat: 42.917, lon: 78.317, desc: 'Alpine village (Days 5–6)' },
  { name: 'Altyn Emel', lat: 44.083, lon: 78.383, desc: 'Steppe/Dunes (Day 7)' },
];

// ─── WMO weather code → emoji + label ────────────────────────────────────────
function weatherCodeInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Clear Sky' };
  if (code <= 2) return { emoji: '🌤️', label: 'Partly Cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Overcast' };
  if (code <= 48) return { emoji: '🌫️', label: 'Foggy' };
  if (code <= 55) return { emoji: '🌦️', label: 'Drizzle' };
  if (code <= 65) return { emoji: '🌧️', label: 'Rain' };
  if (code <= 77) return { emoji: '🌨️', label: 'Snow' };
  if (code <= 82) return { emoji: '🌧️', label: 'Rain Showers' };
  if (code <= 86) return { emoji: '🌨️', label: 'Snow Showers' };
  return { emoji: '⛈️', label: 'Thunderstorm' };
}

// ─── Exchange rates (static, clearly labelled) ────────────────────────────────
const EXCHANGE_RATES: Record<string, number> = {
  USD: 0.0021,
  INR: 0.175,
  EUR: 0.0019,
  GBP: 0.00165,
};

// DEPARTURE DATE
const DEPARTURE = new Date('2026-09-11T09:50:00+06:00');

// ─────────────────────────────────────────────────────────────────────────────
export default function KazakhstanApp() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Currency
  const [kztAmount, setKztAmount] = useState(100000);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Transport calculator
  const [strategyType, setStrategyType] = useState('minivan');

  // Checklist
  const [packingItems, setPackingItems] = useState<PackingItem[]>([
    { id: 1, text: 'Original Passports (Mandatory for Big Almaty Lake border check)', checked: true, category: 'Docs' },
    { id: 2, text: 'International Driving Permit (IDP) + License', checked: true, category: 'Docs' },
    { id: 3, text: 'Cash KZT (~150,000 - 200,000 KZT total for group for Saty/Basshi)', checked: false, category: 'Money' },
    { id: 4, text: 'Powerbank (10,000 - 20,000 mAh for remote nights)', checked: false, category: 'Tech' },
    { id: 5, text: 'Thermal Layers & Windbreaker Jacket (Assy & Shymbulak 0°C)', checked: false, category: 'Clothing' },
    { id: 6, text: 'Soft Duffel Bags (1 per person; avoid hard suitcases)', checked: true, category: 'Luggage' },
    { id: 7, text: 'Offline Maps downloaded on 2GIS & Yandex Maps', checked: false, category: 'Tech' },
    { id: 8, text: '2L Water bottle per person + Dry Snacks/Nuts', checked: false, category: 'Food' },
    { id: 9, text: 'Rubber slippers & small towel for Arasan Baths', checked: false, category: 'Personal' },
    { id: 10, text: 'Sunscreen SPF50 & Sunglasses for Charyn/Dunes', checked: false, category: 'Personal' },
    { id: 11, text: 'First Aid Kit + altitude sickness tablets', checked: false, category: 'Health' },
    { id: 12, text: 'Travel Insurance documents printed & digital copy', checked: false, category: 'Docs' },
  ]);

  // ── NEW: Countdown ──────────────────────────────────────────────────────────
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, departed: false });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = DEPARTURE.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, departed: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds, departed: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── NEW: Live Weather (Open-Meteo, free, no API key) ───────────────────────
  const [weatherData, setWeatherData] = useState<WeatherData[]>(
    WEATHER_LOCATIONS.map(l => ({ location: l.name, temp: 0, tempMin: 0, tempMax: 0, windSpeed: 0, humidity: 0, weatherCode: 0, loading: true }))
  );

  const fetchWeather = useCallback(async () => {
    setWeatherData(prev => prev.map(w => ({ ...w, loading: true, error: undefined })));
    const results = await Promise.all(
      WEATHER_LOCATIONS.map(async (loc) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FAlmaty&forecast_days=1`;
          const res = await fetch(url);
          const data = await res.json();
          return {
            location: loc.name,
            temp: Math.round(data.current.temperature_2m),
            tempMin: Math.round(data.daily.temperature_2m_min[0]),
            tempMax: Math.round(data.daily.temperature_2m_max[0]),
            windSpeed: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
            loading: false,
          };
        } catch {
          return { location: loc.name, temp: 0, tempMin: 0, tempMax: 0, windSpeed: 0, humidity: 0, weatherCode: 0, loading: false, error: 'Failed to fetch' };
        }
      })
    );
    setWeatherData(results);
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // ── Speech synthesis ────────────────────────────────────────────────────────
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── Print handler ───────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  // ── Toggle checklist ────────────────────────────────────────────────────────
  const toggleChecklist = (id: number) => {
    setPackingItems(items => items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // ── Budget stats ─────────────────────────────────────────────────────────────
  const currentDayData = ITINERARY_DATA.find(d => d.day === selectedDay)!;

  const totalTripKZT = useMemo(() =>
    ITINERARY_DATA.reduce((acc, day) => acc + day.activities.reduce((a, act) => a + act.kztExpense, 0), 0),
    []
  );

  const maxDayKZT = useMemo(() =>
    Math.max(...ITINERARY_DATA.map(day => day.activities.reduce((a, act) => a + act.kztExpense, 0))),
    []
  );

  const totalPerPersonUSD = Math.round(totalTripKZT * EXCHANGE_RATES.USD);
  const totalGroupUSD = Math.round(totalPerPersonUSD * 6);

  const currentDayTotal = currentDayData.activities.reduce((sum, a) => sum + a.kztExpense, 0);
  const budgetPercent = Math.round((currentDayTotal / maxDayKZT) * 100);

  // ── Tab config ────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'itinerary', label: 'Day-by-Day Plan', icon: Calendar },
    { id: 'weather', label: 'Live Weather', icon: Sun },
    { id: 'transport', label: 'Car & Luggage', icon: Car },
    { id: 'map', label: 'Interactive Map', icon: Map },
    { id: 'navigation', label: 'Routes & Times', icon: Navigation },
    { id: 'phrases', label: 'Phrasebook', icon: BookOpen },
    { id: 'currency', label: 'Currency & Budget', icon: DollarSign },
    { id: 'checklist', label: 'Packing Checklist', icon: CheckSquare },
  ];

  const dm = isDarkMode;
  const card = `${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${dm ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-200 font-sans pb-20`}>

      {/* ── PRINT LAYOUT (only visible when printing) ── */}
      <div className="hidden print:block p-8">
        <h1 className="text-2xl font-bold mb-1">Kazakhstan 8-Day Master Itinerary</h1>
        <p className="text-sm text-gray-500 mb-6">6 Travelers • Sep 11–18, 2026 • Almaty → Charyn → Saty → Altyn Emel</p>
        {ITINERARY_DATA.map(day => (
          <div key={day.day} className="print-card mb-6">
            <h2 className="font-bold text-base border-b pb-1 mb-2">Day {day.day} — {day.date}: {day.title}</h2>
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

      {/* ── HEADER ── */}
      <header className={`no-print sticky top-0 z-50 border-b backdrop-blur-md ${dm ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/40 text-emerald-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Kazakhstan 8-Day Master Itinerary
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> 6 Travelers • Sep 11–18 • Almaty, Assy, Charyn, Saty, Altyn Emel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* ── Countdown Widget ── */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${dm ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
              <Timer className="w-3.5 h-3.5 text-emerald-400" />
              {countdown.departed ? (
                <span className="font-bold text-emerald-400">✈️ Trip is underway!</span>
              ) : (
                <span>
                  <span className="text-slate-400">Departure in </span>
                  <span className="font-bold text-emerald-400">{countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
                </span>
              )}
            </div>

            <div className={`px-3 py-1.5 rounded-lg border text-xs ${dm ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
              <span className="text-slate-400">Est. Total / Person: </span>
              <span className="font-bold text-emerald-400">{totalTripKZT.toLocaleString()} KZT</span>
              <span className="text-slate-400"> (${totalPerPersonUSD})</span>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
              title="Print Itinerary"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Dark mode */}
            <button
              onClick={() => setIsDarkMode(!dm)}
              className={`p-2 rounded-lg border ${dm ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
              title="Toggle Dark/Light Mode"
            >
              {dm ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-xs font-medium scrollbar-none border-t border-slate-800/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400 font-semibold bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 pt-6 no-print">

        {/* ══════════ ITINERARY TAB ══════════ */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">

            {/* Day Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {ITINERARY_DATA.map(day => {
                const isSel = selectedDay === day.day;
                const dayTotal = day.activities.reduce((s, a) => s + a.kztExpense, 0);
                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSel
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-400/50'
                        : `${dm ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'}`
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{day.date}</div>
                    <div className="text-base font-extrabold mt-0.5">Day {day.day}</div>
                    <div className="text-[11px] truncate mt-1 opacity-90">{day.title}</div>
                    {/* Mini budget indicator */}
                    <div className="mt-2 h-1 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${isSel ? 'bg-white' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.round((dayTotal / maxDayKZT) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[9px] mt-0.5 opacity-70">{(dayTotal / 1000).toFixed(0)}K KZT</div>
                  </button>
                );
              })}
            </div>

            {/* Current Day Header */}
            <div className={`p-5 rounded-2xl border ${card} shadow-md`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    <span>Day {currentDayData.day} • {currentDayData.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {currentDayData.location}</span>
                  </div>
                  <h2 className="text-2xl font-bold mt-1">{currentDayData.title}</h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Luggage className="w-4 h-4 text-amber-400" /> Overnight Stay: <span className="text-amber-300 font-medium">{currentDayData.overnight}</span>
                  </p>
                </div>

                {/* Category filter */}
                <div className={`flex items-center space-x-1 text-xs ${dm ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-300'} p-1 rounded-lg border self-start md:self-auto`}>
                  {['all', 'sightseeing', 'food', 'transit', 'hotel'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                        categoryFilter === cat ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── NEW: Budget Progress Bar ── */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3" />Day {selectedDay} spend vs. most expensive day</span>
                  <span className="font-bold text-emerald-400">{budgetPercent}%</span>
                </div>
                <div className={`h-2.5 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      budgetPercent >= 90 ? 'bg-rose-500' :
                      budgetPercent >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] mt-1 text-slate-500">
                  <span>~{currentDayTotal.toLocaleString()} KZT (~${Math.round(currentDayTotal * EXCHANGE_RATES.USD)} USD / person)</span>
                  <span>Max: {maxDayKZT.toLocaleString()} KZT</span>
                </div>
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 sm:before:left-6 before:w-0.5 before:bg-slate-800">
              {currentDayData.activities
                .filter(act => categoryFilter === 'all' || act.category === categoryFilter)
                .map((act, idx) => (
                  <div key={idx} className="relative pl-8 sm:pl-12 group">
                    <div className="absolute left-1.5 sm:left-4 top-4 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-slate-950 shadow group-hover:scale-125 transition-transform" />
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${dm ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {act.time}
                          </span>
                          <h3 className="text-base font-bold">{act.place}</h3>
                        </div>
                        <div className="text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 self-start sm:self-auto">
                          ~{act.kztExpense.toLocaleString()} KZT (${Math.round(act.kztExpense * EXCHANGE_RATES.USD)})
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-cyan-400" /> What to Do
                          </div>
                          <p className="text-slate-200 leading-relaxed">{act.whatToDo}</p>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1">
                            <Coffee className="w-3.5 h-3.5 text-emerald-400" /> Must Try
                          </div>
                          <p className="text-slate-200 leading-relaxed">{act.mustTry}</p>
                        </div>
                        <div>
                          <div className="font-semibold text-amber-400/90 mb-1 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Look Out For
                          </div>
                          <p className="text-amber-200/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-relaxed">{act.lookOutFor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Day summary */}
            <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'} text-xs flex justify-between items-center`}>
              <span className="text-slate-400">Total Estimated Expenses for Day {selectedDay}:</span>
              <span className="font-bold text-emerald-400 text-sm">
                ~{currentDayTotal.toLocaleString()} KZT
                <span className="text-slate-400 font-normal ml-1">(${Math.round(currentDayTotal * EXCHANGE_RATES.USD)} USD / person)</span>
              </span>
            </div>
          </div>
        )}

        {/* ══════════ LIVE WEATHER TAB ══════════ */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${card}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                  <Sun className="w-6 h-6" /> Live Weather at Key Stops
                </h2>
                <button
                  onClick={fetchWeather}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Real-time data via <span className="text-cyan-400 font-medium">Open-Meteo API</span> (free, no API key). Showing current conditions at your Kazakhstan destinations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {weatherData.map((w, i) => {
                  const locInfo = WEATHER_LOCATIONS[i];
                  const wInfo = weatherCodeInfo(w.weatherCode);
                  return (
                    <div key={w.location} className={`p-5 rounded-2xl border ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mb-1">{locInfo.desc}</div>
                      <div className="font-bold text-base text-slate-100">{w.location}</div>

                      {w.loading ? (
                        <div className="mt-4 space-y-2 animate-pulse">
                          <div className="h-8 w-20 bg-slate-700 rounded" />
                          <div className="h-3 w-32 bg-slate-700 rounded" />
                        </div>
                      ) : w.error ? (
                        <p className="mt-3 text-xs text-rose-400">{w.error}</p>
                      ) : (
                        <>
                          <div className="flex items-end gap-2 mt-3">
                            <span className="text-4xl">{wInfo.emoji}</span>
                            <div>
                              <div className="text-3xl font-extrabold text-slate-100">{w.temp}°C</div>
                              <div className="text-xs text-slate-400">{wInfo.label}</div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${dm ? 'bg-slate-900/60' : 'bg-white'} border ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
                              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                              <div>
                                <div className="text-[10px] text-slate-400">High / Low</div>
                                <div className="font-bold">{w.tempMax}° / {w.tempMin}°</div>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${dm ? 'bg-slate-900/60' : 'bg-white'} border ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
                              <Wind className="w-3.5 h-3.5 text-blue-400" />
                              <div>
                                <div className="text-[10px] text-slate-400">Wind</div>
                                <div className="font-bold">{w.windSpeed} km/h</div>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1.5 p-2 rounded-lg col-span-2 ${dm ? 'bg-slate-900/60' : 'bg-white'} border ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
                              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                              <div>
                                <div className="text-[10px] text-slate-400">Humidity</div>
                                <div className="font-bold">{w.humidity}%</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* September tip */}
              <div className={`mt-6 p-4 rounded-xl border ${dm ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} text-xs`}>
                <p className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" /> September Weather Notes for Kazakhstan
                </p>
                <ul className="space-y-1 text-slate-300">
                  <li>• <strong>Almaty city:</strong> Warm days 18–25°C, cool evenings 10–14°C. Light jacket needed after 7pm.</li>
                  <li>• <strong>Shymbulak (3200m):</strong> 0–8°C even in September. Mandatory thermal layer.</li>
                  <li>• <strong>Charyn Canyon:</strong> Can reach 30°C midday — start early, carry 2L water each.</li>
                  <li>• <strong>Saty/Kolsai:</strong> Crisp alpine air, 10–18°C days, sub-5°C nights.</li>
                  <li>• <strong>Altyn Emel dunes:</strong> Dry steppe, 20–28°C. Dusty winds common in afternoon.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TRANSPORT TAB ══════════ */}
        {activeTab === 'transport' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${card}`}>
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                <Car className="w-6 h-6" /> 6-Person Group Transport Strategy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                A standard 7-seater crossover loses all boot space when 3 rows are folded out. Here is how to organize vehicles, roof gear, and luggage storage for 6 travelers.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'minivan', title: 'Option A: Full Minivan', models: 'Kia Carnival / Hyundai Staria', dailyRate: 75000, pros: 'Fits 6 people + luggage inside comfortably; single driver needed', cons: 'Lower clearance (stick to main asphalt/gravel tracks)' },
                  { id: '2crossovers', title: 'Option B: 2 Crossovers', models: '2x Hyundai Tucson / Geely Coolray', dailyRate: 60000, pros: 'High ground clearance, massive luggage room, total flexibility', cons: 'Requires 2 drivers with IDP & 2 rental deposits' },
                  { id: 'driver', title: 'Option C: Private Driver', models: 'Toyota HiAce / Sprinter Minivan', dailyRate: 100000, pros: 'Zero car liability, no security deposit, driver handles unpaved roads', cons: 'Higher daily cost; less privacy' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStrategyType(opt.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      strategyType === opt.id
                        ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-500/20'
                        : `${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{opt.title}</span>
                      {strategyType === opt.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono mt-1">~{opt.dailyRate.toLocaleString()} KZT / day</div>
                    <div className="text-[11px] text-slate-400 mt-2">{opt.models}</div>
                    <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] space-y-1">
                      <p className="text-emerald-300">✓ {opt.pros}</p>
                      <p className="text-rose-300">✕ {opt.cons}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className={`mt-6 p-4 rounded-xl border ${dm ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'} flex flex-col md:flex-row justify-between items-center gap-4 text-xs`}>
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="font-bold">Days 5–8 Road Trip Duration:</span>
                    <span className="text-slate-400 ml-2">3 Days Rental Window</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px]">TOTAL RENTAL (3 DAYS)</div>
                    <div className="text-base font-bold text-emerald-400">
                      ~{((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * 3).toLocaleString()} KZT
                    </div>
                  </div>
                  <div className="border-l border-slate-700 h-8" />
                  <div>
                    <div className="text-slate-400 text-[10px]">PER PERSON (6 TRAVELERS)</div>
                    <div className="text-base font-bold text-cyan-400">
                      ~{Math.round(((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * 3) / 6).toLocaleString()} KZT
                      <span className="text-xs font-normal text-slate-400 ml-1">(${Math.round((((strategyType === 'minivan' ? 75000 : strategyType === '2crossovers' ? 60000 : 100000) * 3) / 6) * EXCHANGE_RATES.USD)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-2xl border ${card}`}>
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Roof Rack Transport Safety Rules
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Must Have Crossbars:</strong> Never tie bags directly to smooth roofs without crossbars; straps wrap through windows causing leaks and scratches.</span></li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Use IPX Cargo Bags / Hard Roof Box:</strong> Gravel roads in Kazakhstan generate heavy dust storms. Soft bags tied with rope get covered in dirt or soaked.</span></li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Weight Limit:</strong> Cap roof weight at 50–70 kg maximum to prevent top-heavy instability on windy mountain passes.</span></li>
                </ul>
              </div>
              <div className={`p-5 rounded-2xl border ${card}`}>
                <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <Luggage className="w-4 h-4" /> Hotel Luggage Storage Strategy
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Almaty Base Lockers:</strong> Leave your main heavy suitcases at your Almaty city hotel storage room on Day 5 morning for free.</span></li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Pack 3-Day Soft Duffels:</strong> Take only 1 small soft backpack/duffel per person for the Saty & Basshi guesthouse nights.</span></li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Re-pack on Day 8:</strong> Rejoin main luggage back in Almaty before flying out on Sunday night.</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ INTERACTIVE MAP TAB ══════════ */}
        {activeTab === 'map' && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                <Map className="w-6 h-6" /> Interactive Trip Map
              </h2>
              <p className="text-xs text-slate-400 mt-1">Click any marker to see the activity details. Powered by OpenStreetMap — no API key needed.</p>
            </div>
            <MapTab isDarkMode={dm} />
          </div>
        )}

        {/* ══════════ NAVIGATION TAB ══════════ */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${card}`}>
              <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                <Navigation className="w-6 h-6" /> Kazakhstan Navigation Helper
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Google Maps has limited offline route plotting in Central Asia. Use these locally dominant apps for turn-by-turn routing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  { name: 'Yandex Maps / Yandex Go', badge: 'Essential', color: 'yellow', desc: 'Use Yandex Go for all city taxi hailing in Almaty (choose Yandex XL for 6 people with small bags). Download Almaty Region offline map in Yandex Maps.' },
                  { name: '2GIS (Dva GIS)', badge: 'City Precise', color: 'emerald', desc: 'Exact building entrances, city bus line numbers (Bus 12 to Medeu), offline house numbers, and pedestrian walking paths inside Almaty.' },
                ].map(app => (
                  <div key={app.name} className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm text-${app.color}-400`}>{app.name}</span>
                      <span className={`text-[10px] bg-${app.color}-400/20 text-${app.color}-300 px-2 py-0.5 rounded border border-${app.color}-400/30`}>{app.badge}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{app.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${card}`}>
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" /> Verified Distance & Travel Time Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${dm ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3">To Destination</th>
                      <th className="py-2.5 px-3">Distance</th>
                      <th className="py-2.5 px-3">Est. Travel Time</th>
                      <th className="py-2.5 px-3">Road Conditions & Advice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {ROUTE_LEGS.map((leg, idx) => (
                      <tr key={idx} className={`${dm ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-3 font-semibold text-slate-200">{leg.from}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">{leg.to}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">{leg.dist}</td>
                        <td className="py-3 px-3 font-mono text-amber-300 font-bold">{leg.time}</td>
                        <td className="py-3 px-3 text-slate-400">{leg.road}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ PHRASEBOOK TAB ══════════ */}
        {activeTab === 'phrases' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${card}`}>
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                <BookOpen className="w-6 h-6" /> Kazakh & Russian Offline Phrasebook
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Russian is universally spoken across Kazakhstan alongside Kazakh. Tap the audio button to pronounce phrases aloud.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {PHRASES.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${dm ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{p.cat}</div>
                      <div className="text-sm font-bold mt-0.5">{p.mean}</div>
                      <div className="text-xs text-slate-300 mt-1 font-medium">
                        Russian: <span className="text-cyan-300">{p.ru}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 italic">Pronunciation: &quot;{p.trans}&quot;</div>
                    </div>
                    <button
                      onClick={() => speakText(p.ru)}
                      className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors border border-emerald-500/30 shrink-0"
                      title="Listen Pronunciation"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ CURRENCY TAB ══════════ */}
        {activeTab === 'currency' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${card}`}>
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                <DollarSign className="w-6 h-6" /> Currency Converter & Budget Calculator
              </h2>
              <p className="text-[10px] text-slate-500 mt-1">Static rates (Sep 2026 est.): 1 USD ≈ 475 KZT • 1 EUR ≈ 526 KZT • 1 GBP ≈ 606 KZT • 1 INR ≈ 5.7 KZT</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Amount in Kazakhstani Tenge (KZT)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kztAmount}
                      onChange={(e) => setKztAmount(Number(e.target.value))}
                      className={`w-full p-3 rounded-xl border text-lg font-mono font-bold ${dm ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-bold">KZT</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Target Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-base font-bold ${dm ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col justify-center ${dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-xs text-emerald-400 font-semibold uppercase">Converted Equivalent</div>
                  <div className="text-2xl font-extrabold text-emerald-300 font-mono mt-1">
                    {(kztAmount * EXCHANGE_RATES[selectedCurrency]).toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Approx. Rate: 1 {selectedCurrency} ≈ {Math.round(1 / EXCHANGE_RATES[selectedCurrency])} KZT
                  </div>
                </div>
              </div>
            </div>

            {/* Budget breakdown per day — with progress bars */}
            <div className={`p-6 rounded-2xl border ${card}`}>
              <h3 className="font-bold text-base mb-4">Daily Budget Breakdown — All 8 Days</h3>
              <div className="space-y-3">
                {ITINERARY_DATA.map(day => {
                  const total = day.activities.reduce((s, a) => s + a.kztExpense, 0);
                  const pct = Math.round((total / maxDayKZT) * 100);
                  return (
                    <div key={day.day}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">Day {day.day} — <span className="text-slate-400">{day.title.slice(0, 35)}{day.title.length > 35 ? '…' : ''}</span></span>
                        <span className="font-mono font-bold text-emerald-400">{total.toLocaleString()} KZT <span className="text-slate-400 font-normal">(${Math.round(total * EXCHANGE_RATES.USD)})</span></span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className={`h-2 rounded-full ${pct >= 90 ? 'bg-rose-500' : pct >= 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-slate-400 text-[10px]">TOTAL PER PERSON</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">~{totalTripKZT.toLocaleString()} KZT</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">${totalPerPersonUSD} USD</div>
                </div>
                <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-slate-400 text-[10px]">TOTAL FOR 6 TRAVELERS</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">~{(totalTripKZT * 6).toLocaleString()} KZT</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">${totalGroupUSD} USD</div>
                </div>
                <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-slate-400 text-[10px]">ESTIMATED CASH NEEDED</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">~200,000 KZT</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">For Saty/Basshi Guesthouses</div>
                </div>
                <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-slate-400 text-[10px]">CABLE CARS & ENTRY FEES</div>
                  <div className="text-lg font-bold text-teal-300 mt-1">~20,000 KZT / person</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Shymbulak, Kok Tobe, Parks</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ CHECKLIST TAB ══════════ */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${card}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                  <CheckSquare className="w-6 h-6" /> Kazakhstan Pre-Trip Interactive Checklist
                </h2>
                <span className="text-xs text-slate-400">
                  {packingItems.filter(i => i.checked).length} / {packingItems.length} packed
                </span>
              </div>
              <div className="mt-2 mb-4">
                <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.round((packingItems.filter(i => i.checked).length / packingItems.length) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Tick off essential items before departure. Border control rules at Big Almaty Lake and cash requirements in remote villages are strictly enforced.
              </p>
              <div className="space-y-2">
                {packingItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      item.checked
                        ? `${dm ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-300' : 'bg-emerald-50 border-emerald-200 text-slate-700'}`
                        : `${dm ? 'bg-slate-800/40 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'}`}>
                        {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-medium ${item.checked ? 'line-through opacity-70' : ''}`}>{item.text}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${dm ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-500'}`}>
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${dm ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50 border-rose-200'}`}>
              <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                <PhoneCall className="w-4 h-4" /> Emergency Phone Numbers in Kazakhstan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs font-mono">
                {[
                  { label: 'RESCUE / FIRE', number: '101 / 112' },
                  { label: 'POLICE', number: '102' },
                  { label: 'AMBULANCE', number: '103' },
                  { label: 'ALMATY AIRPORT', number: '+7 727 270 3333' },
                ].map(e => (
                  <div key={e.label} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">{e.label}</div>
                    <div className="font-bold text-rose-300 text-base">{e.number}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
