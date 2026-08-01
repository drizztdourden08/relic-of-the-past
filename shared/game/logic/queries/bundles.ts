/* @layer shared-game @kind logic */
/**
 * Screen Bundle — groups overworld screens into logical areas. Moved from
 * data/screens/bundles.ts — logic unchanged, ScreenDefinition → ScreenRecord,
 * `location` string → getLocation(locationId).
 */
import { find, getLocation } from '../../data';
import type { ScreenRecord } from '../../data';

interface ScreenBundle {
  /** Bundle display name (e.g. "the first castle") */
  name: string;
  /** All screen indices in this bundle, layout order: [NW, NE, SW, SE] for 2×2 */
  screens: number[];
  /** Grid layout: columns */
  cols: number;
  /** Grid layout: rows */
  rows: number;
  /** Per-screen sub-name (e.g. "NW", "NE", "SW", "SE") */
  subNames: Record<number, string>;
  /** Per-screen full name (e.g. "the first castle NW") */
  screenNames: Record<number, string>;
  /** Is this a multi-screen bundle? */
  isMulti: boolean;
  /** The head screen index (top-left of the group) */
  head: number;
  /** Indoor room shape when intra-room boundaries exist ('2x2'|'2x1'|'1x2') */
  roomShape?: '2x2' | '2x1' | '1x2' | '1x1';
  /** Which quadrant Link is currently in (for multi-screen rooms) */
  activeQuadrant?: { x: number; y: number };
  /** Effective layout from dungeon map data (WxH cells this room occupies on the map) */
  effectiveLayout?: { width: number; height: number };
}

const QUAD_POSITIONS: Record<number, string> = {
  0: 'NW', // head
  1: 'NE', // head + 1
  2: 'SW', // head + 8
  3: 'SE', // head + 9
};

let cachedByIndex: Map<number, ScreenRecord> | null = null;

const screenByIndex = (): Map<number, ScreenRecord> => {
  if (!cachedByIndex) {
    cachedByIndex = new Map(
      find('screen', s => s.kind === 'overworld' && s.gameId.overworldIndex !== undefined)
        .map(s => [s.gameId.overworldIndex!, s]),
    );
  }
  return cachedByIndex;
};

const label = (screen: ScreenRecord): string => screen.vanillaName ?? screen.randomizerName;
const locationName = (screen: ScreenRecord): string => getLocation(screen.locationId).randomizerName;

const buildScreenBundle = (group: number[]): ScreenBundle => {
  const byIndex = screenByIndex();

  if (group.length === 1) {
    const screenIndex = group[0];
    const screen = byIndex.get(screenIndex);
    const name = screen ? locationName(screen) : `Screen 0x${screenIndex.toString(16).toUpperCase()}`;
    const screenName = screen ? label(screen) : name;
    return {
      name,
      screens: group,
      cols: 1,
      rows: 1,
      subNames: { [screenIndex]: '' },
      screenNames: { [screenIndex]: screenName },
      isMulti: false,
      head: screenIndex,
    };
  }

  // Multi-screen (2×2)
  const head = group[0];
  const headScreen = byIndex.get(head);
  const bundleName = headScreen ? locationName(headScreen) : `Area 0x${head.toString(16).toUpperCase()}`;

  const subNames: Record<number, string> = {};
  const screenNames: Record<number, string> = {};
  for (let i = 0; i < group.length; i++) {
    const scr = group[i];
    const screen = byIndex.get(scr);
    subNames[scr] = QUAD_POSITIONS[i] ?? `#${i}`;
    screenNames[scr] = screen ? label(screen) : `${bundleName} ${subNames[scr]}`;
  }

  return {
    name: bundleName,
    screens: group,
    cols: 2,
    rows: 2,
    subNames,
    screenNames,
    isMulti: true,
    head,
  };
};

export { buildScreenBundle };
export type { ScreenBundle };
