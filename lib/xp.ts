export interface XpInputs {
  durationMinutes: number;
  distanceMiles: number;
}

const BASE_XP = 30;
const MAX_XP = 150;

export function calculateAdventureXp({ durationMinutes, distanceMiles }: XpInputs): number {
  const safeMinutes = Number.isFinite(durationMinutes) ? Math.max(0, durationMinutes) : 0;
  const safeMiles = Number.isFinite(distanceMiles) ? Math.max(0, distanceMiles) : 0;

  const total = BASE_XP + safeMinutes + safeMiles * 10;
  return Math.min(MAX_XP, Math.round(total));
}
