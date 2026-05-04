export type ProgramDifficulty = 'easy' | 'moderate' | 'hard';

export interface ProgramLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  maps_url: string;
}

export interface AdventureDailyMission {
  day: number;
  title: string;
  distance_miles: number;
  duration_minutes: number;
  xp: number;
}

export interface AdventureProgram {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  weekly_miles_target: number;
  difficulty: ProgramDifficulty;
  locations: ProgramLocation[];
  daily_missions: AdventureDailyMission[];
}

export const adventurePrograms: AdventureProgram[] = [
  {
    id: 'sd-coastal-starter',
    title: 'San Diego Coastal Starter',
    description: 'A gentle beach-to-park routine to build consistency and confidence.',
    duration_days: 14,
    weekly_miles_target: 10,
    difficulty: 'easy',
    locations: [
      {
        name: 'Dog Beach OB',
        address: '5156 W Point Loma Blvd, San Diego, CA 92107',
        lat: 32.7525,
        lng: -117.2528,
        maps_url: 'https://maps.google.com/?q=32.7525,-117.2528',
      },
      {
        name: 'Mission Bay Park',
        address: '2688 E Mission Bay Dr, San Diego, CA 92109',
        lat: 32.7896,
        lng: -117.2231,
        maps_url: 'https://maps.google.com/?q=32.7896,-117.2231',
      },
    ],
    daily_missions: [
      { day: 1, title: 'Sunset shoreline walk', distance_miles: 1.5, duration_minutes: 30, xp: 55 },
      { day: 2, title: 'Neighborhood sniffari', distance_miles: 1.2, duration_minutes: 25, xp: 48 },
      { day: 3, title: 'Beach recall reps', distance_miles: 1.7, duration_minutes: 35, xp: 62 },
      { day: 4, title: 'Restorative park loop', distance_miles: 1.0, duration_minutes: 22, xp: 42 },
      { day: 5, title: 'Mission Bay power walk', distance_miles: 2.0, duration_minutes: 40, xp: 70 },
      { day: 6, title: 'Low-distraction leash walk', distance_miles: 1.4, duration_minutes: 28, xp: 52 },
      { day: 7, title: 'Weekend beach run', distance_miles: 2.2, duration_minutes: 42, xp: 74 },
    ],
  },
  {
    id: 'trail-pack-builder',
    title: 'Trail Pack Builder',
    description: 'Progressive trail mileage for active dogs and handlers.',
    duration_days: 21,
    weekly_miles_target: 16,
    difficulty: 'moderate',
    locations: [
      {
        name: 'Mission Trails',
        address: '1 Father Junipero Serra Trail, San Diego, CA 92119',
        lat: 32.8397,
        lng: -117.0421,
        maps_url: 'https://maps.google.com/?q=32.8397,-117.0421',
      },
      {
        name: 'Lake Miramar',
        address: '10710 Scripps Lake Dr, San Diego, CA 92131',
        lat: 32.9179,
        lng: -117.0898,
        maps_url: 'https://maps.google.com/?q=32.9179,-117.0898',
      },
    ],
    daily_missions: [
      { day: 1, title: 'Trail warm-up loop', distance_miles: 2.0, duration_minutes: 38, xp: 68 },
      { day: 2, title: 'Hill repeat intervals', distance_miles: 2.3, duration_minutes: 44, xp: 77 },
      { day: 3, title: 'Lake pace control', distance_miles: 2.5, duration_minutes: 46, xp: 81 },
      { day: 4, title: 'Recovery mileage', distance_miles: 1.6, duration_minutes: 30, xp: 56 },
      { day: 5, title: 'Long trail session', distance_miles: 3.1, duration_minutes: 56, xp: 97 },
      { day: 6, title: 'Sniff break + cadence', distance_miles: 2.0, duration_minutes: 37, xp: 67 },
      { day: 7, title: 'Weekend summit push', distance_miles: 3.4, duration_minutes: 60, xp: 104 },
    ],
  },
  {
    id: 'urban-park-circuit',
    title: 'Urban Park Circuit',
    description: 'Rotate city parks to add novelty while keeping mileage manageable.',
    duration_days: 14,
    weekly_miles_target: 12,
    difficulty: 'moderate',
    locations: [
      {
        name: 'Balboa Park',
        address: '1549 El Prado, San Diego, CA 92101',
        lat: 32.7341,
        lng: -117.1446,
        maps_url: 'https://maps.google.com/?q=32.7341,-117.1446',
      },
      {
        name: 'Kate Sessions Park',
        address: '5115 Soledad Rd, San Diego, CA 92109',
        lat: 32.8075,
        lng: -117.2471,
        maps_url: 'https://maps.google.com/?q=32.8075,-117.2471',
      },
    ],
    daily_missions: [
      { day: 1, title: 'Balboa easy loop', distance_miles: 1.8, duration_minutes: 34, xp: 62 },
      { day: 2, title: 'City leash manners', distance_miles: 1.5, duration_minutes: 32, xp: 57 },
      { day: 3, title: 'Park play intervals', distance_miles: 2.0, duration_minutes: 40, xp: 70 },
      { day: 4, title: 'Neighborhood decompression', distance_miles: 1.3, duration_minutes: 25, xp: 48 },
      { day: 5, title: 'Hilltop route day', distance_miles: 2.4, duration_minutes: 45, xp: 79 },
      { day: 6, title: 'Scent work walk', distance_miles: 1.4, duration_minutes: 30, xp: 52 },
      { day: 7, title: 'Weekend park circuit', distance_miles: 2.6, duration_minutes: 50, xp: 86 },
    ],
  },
  {
    id: 'torrey-pines-challenge',
    title: 'Torrey Pines Challenge',
    description: 'Conditioning-focused coastal climbs with rest-balanced recovery days.',
    duration_days: 28,
    weekly_miles_target: 20,
    difficulty: 'hard',
    locations: [
      {
        name: 'Torrey Pines',
        address: '12600 N Torrey Pines Rd, La Jolla, CA 92037',
        lat: 32.9213,
        lng: -117.2512,
        maps_url: 'https://maps.google.com/?q=32.9213,-117.2512',
      },
      {
        name: 'Del Mar Dog Beach',
        address: '3902 29th St, Del Mar, CA 92014',
        lat: 32.9499,
        lng: -117.2636,
        maps_url: 'https://maps.google.com/?q=32.9499,-117.2636',
      },
    ],
    daily_missions: [
      { day: 1, title: 'Cliffside ascent opener', distance_miles: 2.6, duration_minutes: 50, xp: 86 },
      { day: 2, title: 'Interval descent control', distance_miles: 2.8, duration_minutes: 54, xp: 92 },
      { day: 3, title: 'Beach recovery jog', distance_miles: 2.0, duration_minutes: 38, xp: 68 },
      { day: 4, title: 'Elevation ladder set', distance_miles: 3.3, duration_minutes: 62, xp: 105 },
      { day: 5, title: 'Tempo trail block', distance_miles: 3.0, duration_minutes: 58, xp: 98 },
      { day: 6, title: 'Mobility walk', distance_miles: 1.7, duration_minutes: 30, xp: 57 },
      { day: 7, title: 'Long coastal mission', distance_miles: 3.8, duration_minutes: 70, xp: 118 },
    ],
  },
  {
    id: 'senior-gentle-miles',
    title: 'Senior Gentle Miles',
    description: 'Low-impact routine to keep senior dogs active without overloading joints.',
    duration_days: 14,
    weekly_miles_target: 7,
    difficulty: 'easy',
    locations: [
      {
        name: 'Lake Murray Path',
        address: '5540 Kiowa Dr, La Mesa, CA 91942',
        lat: 32.7864,
        lng: -117.0378,
        maps_url: 'https://maps.google.com/?q=32.7864,-117.0378',
      },
      {
        name: 'Liberty Station NTC Park',
        address: '2455 Cushing Rd, San Diego, CA 92106',
        lat: 32.7372,
        lng: -117.2133,
        maps_url: 'https://maps.google.com/?q=32.7372,-117.2133',
      },
    ],
    daily_missions: [
      { day: 1, title: 'Gentle morning stroll', distance_miles: 0.9, duration_minutes: 22, xp: 40 },
      { day: 2, title: 'Sniff-heavy recovery walk', distance_miles: 0.8, duration_minutes: 20, xp: 38 },
      { day: 3, title: 'Easy loop with breaks', distance_miles: 1.1, duration_minutes: 24, xp: 45 },
      { day: 4, title: 'Flat path confidence walk', distance_miles: 1.0, duration_minutes: 23, xp: 43 },
      { day: 5, title: 'Park social stroll', distance_miles: 1.2, duration_minutes: 26, xp: 48 },
      { day: 6, title: 'Short leash check-in', distance_miles: 0.7, duration_minutes: 18, xp: 35 },
      { day: 7, title: 'Weekend wellness walk', distance_miles: 1.3, duration_minutes: 28, xp: 50 },
    ],
  },
];

export const adventureProgramsById = Object.fromEntries(
  adventurePrograms.map((program) => [program.id, program])
) as Record<string, AdventureProgram>;
