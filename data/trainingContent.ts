export interface TrainingLesson {
  id: string;
  title: string;
  body: string;
  xpReward: number;
}

export interface TrainingModuleContent {
  slug: string;
  lessons: TrainingLesson[];
}

export const trainingContent: TrainingModuleContent[] = [
  {
    slug: 'loose-leash',
    lessons: [
      {
        id: 'll-1',
        title: 'Start with focus',
        body: 'Before moving, reward your dog for checking in with you. Keep sessions short so your dog learns that staying near you pays off quickly.',
        xpReward: 20,
      },
      {
        id: 'll-2',
        title: 'Mark the right zone',
        body: 'Choose one side and reward when your dog stays at your leg. Consistency helps your dog understand the exact walking position you want.',
        xpReward: 20,
      },
      {
        id: 'll-3',
        title: 'Stop-and-reset',
        body: 'When the leash tightens, stop walking and wait for slack. Resume only when your dog returns to you so pulling no longer gets progress.',
        xpReward: 25,
      },
      {
        id: 'll-4',
        title: 'Add direction changes',
        body: 'Make gentle turns and reward your dog for following smoothly. This teaches your dog to pay attention to your movement, not just the environment.',
        xpReward: 25,
      },
      {
        id: 'll-5',
        title: 'Generalize outside',
        body: 'Practice in slightly busier areas once basics are stable. Increase distractions gradually and celebrate small wins to build reliability.',
        xpReward: 30,
      },
    ],
  },
  {
    slug: 'recall',
    lessons: [
      {
        id: 're-1',
        title: 'Build name response',
        body: 'Say your dog’s name once and reward eye contact right away. Repeat in low-distraction spaces to create a strong habit.',
        xpReward: 20,
      },
      {
        id: 're-2',
        title: 'Introduce recall cue',
        body: 'Use a clear cue like “come” and reward generously when your dog reaches you. Keep your tone upbeat so the cue always feels positive.',
        xpReward: 25,
      },
      {
        id: 're-3',
        title: 'Add distance safely',
        body: 'Practice longer recalls on a long line to protect success. Reward fast returns and release your dog again to avoid ending the fun every time.',
        xpReward: 25,
      },
      {
        id: 're-4',
        title: 'Proof around distractions',
        body: 'Train near mild distractions and move farther from triggers as needed. If your dog struggles, lower difficulty and rebuild confidence.',
        xpReward: 30,
      },
    ],
  },
  {
    slug: 'crate-training',
    lessons: [
      {
        id: 'ct-1',
        title: 'Create positive crate value',
        body: 'Toss treats into the crate and let your dog enter freely. Keep the door open so the crate feels safe and voluntary.',
        xpReward: 20,
      },
      {
        id: 'ct-2',
        title: 'Build short stays',
        body: 'Feed in the crate and close the door briefly during calm moments. Open before your dog gets stressed to build trust.',
        xpReward: 25,
      },
      {
        id: 'ct-3',
        title: 'Increase duration gradually',
        body: 'Extend crate time in small increments while your dog stays relaxed. Pair with chew items or enrichment to make downtime rewarding.',
        xpReward: 25,
      },
      {
        id: 'ct-4',
        title: 'Practice real-life routines',
        body: 'Use the crate during short errands and bedtime with predictable cues. Consistent routines help your dog settle quickly and confidently.',
        xpReward: 30,
      },
    ],
  },
];

export const trainingContentBySlug = Object.fromEntries(
  trainingContent.map((module) => [module.slug, module])
) as Record<string, TrainingModuleContent>;
