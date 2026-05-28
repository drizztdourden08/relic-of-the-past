/**
 * Screen name lookup derived from region definitions.
 * Maps overworld screen index → region name.
 */
import { ALL_REGIONS } from '../data/regions';

const screenNameMap: Record<number, string> = {};
for (const r of ALL_REGIONS) {
  if (r.inGameIndex != null && (r.type === 'lightWorld' || r.type === 'darkWorld')) {
    screenNameMap[r.inGameIndex] = r.name;
  }
}

export const SCREEN_NAMES: Readonly<Record<number, string>> = screenNameMap;

export function getScreenName(index: number): string {
  return SCREEN_NAMES[index] ?? `Screen 0x${index.toString(16).toUpperCase()}`;
}
