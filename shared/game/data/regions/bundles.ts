/**
 * Screen Bundle — groups overworld screens into logical areas.
 *
 * Single screens get a bundle of size 1.
 * Big screens (2×2) get a bundle of size 4 with positional sub-names.
 */

import { ALL_LIGHT_WORLD_REGIONS } from './light-world';
import { ALL_DARK_WORLD_REGIONS } from './dark-world';
import type { RegionDefinition } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScreenBundle {
  /** Bundle display name (e.g. "Hyrule Castle") — from region displayName */
  name: string;
  /** All screen indices in this bundle, layout order: [NW, NE, SW, SE] for 2×2 */
  screens: number[];
  /** Grid layout: columns */
  cols: number;
  /** Grid layout: rows */
  rows: number;
  /** Per-screen sub-name (e.g. "NW", "NE", "SW", "SE") */
  subNames: Record<number, string>;
  /** Per-screen full name (e.g. "Hyrule Castle NW") */
  screenNames: Record<number, string>;
  /** Is this a multi-screen bundle? */
  isMulti: boolean;
  /** The head screen index (top-left of the group) */
  head: number;
  /** Indoor room shape when intra-room boundaries exist ('2x2'|'2x1'|'1x2') */
  roomShape?: '2x2' | '2x1' | '1x2' | '1x1';
  /** Which quadrant Link is currently in (for multi-screen rooms) */
  activeQuadrant?: { x: number; y: number };
}

// ─── Positional Sub-Names ────────────────────────────────────────────────────

const QUAD_POSITIONS: Record<number, string> = {
  0: 'NW', // head
  1: 'NE', // head + 1
  2: 'SW', // head + 8
  3: 'SE', // head + 9
};

// ─── Region Lookup ───────────────────────────────────────────────────────────

const regionByIndex = new Map<number, RegionDefinition>(
  [...ALL_LIGHT_WORLD_REGIONS, ...ALL_DARK_WORLD_REGIONS]
    .filter(r => r.inGameIndex != null && (r.type === 'lightWorld' || r.type === 'darkWorld'))
    .map(r => [r.inGameIndex!, r])
);

// ─── Bundle Construction ─────────────────────────────────────────────────────

/**
 * Build a ScreenBundle from a big-screen group (as returned by getBigScreenGroup).
 * @param group Array of screen indices — [head, head+1, head+8, head+9] for big, [single] for small
 */
export function buildScreenBundle(group: number[]): ScreenBundle {
  if (group.length === 1) {
    const screenIndex = group[0];
    const region = regionByIndex.get(screenIndex);
    const name = region?.type === 'cave'
      ? (region.subtitle ?? region.name)
      : (region?.displayName ?? region?.name ?? `Screen 0x${screenIndex.toString(16).toUpperCase()}`);
    const screenName = region?.name ?? name;
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
  const headRegion = regionByIndex.get(head);
  const bundleName = headRegion?.displayName ?? `Area 0x${head.toString(16).toUpperCase()}`;

  const subNames: Record<number, string> = {};
  const screenNames: Record<number, string> = {};
  for (let i = 0; i < group.length; i++) {
    const scr = group[i];
    const region = regionByIndex.get(scr);
    subNames[scr] = QUAD_POSITIONS[i] ?? `#${i}`;
    screenNames[scr] = region?.name ?? `${bundleName} ${subNames[scr]}`;
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
}
