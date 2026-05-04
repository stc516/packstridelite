export interface TrainingDailyLesson {
  day: number;
  module_slug: string;
  title: string;
  duration_minutes: number;
  xp: number;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  daily_lessons: TrainingDailyLesson[];
}

export const trainingPrograms: TrainingProgram[] = [
  {
    id: '8-week-loose-leash',
    title: '8-Week Loose Leash',
    description: 'A structured leash skills progression with daily drills and accountability.',
    duration_days: 56,
    difficulty: 'moderate',
    daily_lessons: [
      { day: 1, module_slug: 'loose-leash', title: 'Focus before movement', duration_minutes: 15, xp: 25 },
      { day: 2, module_slug: 'loose-leash', title: 'Reward zone reps', duration_minutes: 18, xp: 28 },
      { day: 3, module_slug: 'loose-leash', title: 'Stop-and-reset practice', duration_minutes: 20, xp: 30 },
      { day: 4, module_slug: 'loose-leash', title: 'Direction change game', duration_minutes: 22, xp: 32 },
      { day: 5, module_slug: 'loose-leash', title: 'Distraction exposure', duration_minutes: 24, xp: 35 },
      { day: 6, module_slug: 'loose-leash', title: 'Long block consistency', duration_minutes: 25, xp: 36 },
      { day: 7, module_slug: 'loose-leash', title: 'Weekly review circuit', duration_minutes: 20, xp: 30 },
    ],
  },
  {
    id: 'puppy-foundations',
    title: 'Puppy Foundations',
    description: 'Core obedience, confidence building, and socialization for young dogs.',
    duration_days: 28,
    difficulty: 'easy',
    daily_lessons: [
      { day: 1, module_slug: 'recall', title: 'Name game and eye contact', duration_minutes: 12, xp: 22 },
      { day: 2, module_slug: 'recall', title: 'Short recall reps', duration_minutes: 14, xp: 24 },
      { day: 3, module_slug: 'loose-leash', title: 'Leash intro and pacing', duration_minutes: 15, xp: 25 },
      { day: 4, module_slug: 'crate-training', title: 'Crate value basics', duration_minutes: 12, xp: 22 },
      { day: 5, module_slug: 'crate-training', title: 'Calm settle routine', duration_minutes: 14, xp: 24 },
      { day: 6, module_slug: 'recall', title: 'Recall with mild distractions', duration_minutes: 16, xp: 26 },
      { day: 7, module_slug: 'loose-leash', title: 'Foundations recap', duration_minutes: 15, xp: 25 },
    ],
  },
  {
    id: 'senior-wellness',
    title: 'Senior Wellness',
    description: 'Low-impact routine that blends mobility, calm handling, and confidence.',
    duration_days: 21,
    difficulty: 'easy',
    daily_lessons: [
      { day: 1, module_slug: 'crate-training', title: 'Comfort station setup', duration_minutes: 10, xp: 20 },
      { day: 2, module_slug: 'recall', title: 'Short recall confidence', duration_minutes: 12, xp: 22 },
      { day: 3, module_slug: 'crate-training', title: 'Relaxation mat routine', duration_minutes: 12, xp: 22 },
      { day: 4, module_slug: 'loose-leash', title: 'Slow leash cadence', duration_minutes: 14, xp: 24 },
      { day: 5, module_slug: 'recall', title: 'Cue refresh and reward', duration_minutes: 12, xp: 22 },
      { day: 6, module_slug: 'crate-training', title: 'Independent settle', duration_minutes: 13, xp: 23 },
      { day: 7, module_slug: 'loose-leash', title: 'Weekly wellness review', duration_minutes: 14, xp: 24 },
    ],
  },
];

export const trainingProgramsById = Object.fromEntries(
  trainingPrograms.map((program) => [program.id, program])
) as Record<string, TrainingProgram>;
