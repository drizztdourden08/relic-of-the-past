import { ALL_REGIONS } from '../data/regions';

/**
 * Screen name lookup — derived from region dataset (single source of truth).
 */
export const SCREEN_NAMES: Record<number, string> = Object.fromEntries(
  ALL_REGIONS
    .filter(r => r.inGameIndex != null && (r.type === 'lightWorld' || r.type === 'darkWorld'))
    .map(r => [r.inGameIndex!, r.name])
);

export function getScreenName(index: number): string {
  return SCREEN_NAMES[index] ?? `Screen 0x${index.toString(16).padStart(2, '0')}`;
}
