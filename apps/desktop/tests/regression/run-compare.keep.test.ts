/* @layer test @kind spec */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROOT } from './corpus';
import {
  EXPECTED_DROPPED_LOCATIONS, EXPECTED_NAME_CHANGES, EXPECTED_NEW_CHECKS, EXPECTED_PLACEMENT_CHANGES,
  EXPECTED_SCREEN_ADDITIONS, EXPECTED_SCREEN_COLUMN_CHANGE, EXPECTED_STATUS_CHANGES,
} from './expected-changes.data';

type Status = 'completed' | 'reachable' | 'blocked';
interface SaveShot {
  inventory: string[];
  completed: string[];
  normal: Record<string, Status>;
  reachableScreens: string[];
  seeds: Record<string, { byCheck: Record<string, Status>; available: string[] }>;
}
interface Shot { names: Record<string, string>; placements: Record<string, unknown>; saves: Record<string, SaveShot> }

const shotPath = (label: string): string => resolve(ROOT, `.user-data/net/${label}.json`);
const read = (label: string): Shot => JSON.parse(readFileSync(shotPath(label), 'utf8')) as Shot;
const BASE = process.env.ROTP_NET_BASE ?? 'baseline';
const CURRENT = process.env.ROTP_NET_CURRENT ?? 'current';
const ready = process.env.ROTP_NET_BASE !== undefined && existsSync(shotPath(BASE)) && existsSync(shotPath(CURRENT));

const allowed = (save: string, checkId: string, from: Status, to: Status): boolean =>
  EXPECTED_STATUS_CHANGES.some((row) => (row.save === '*' || row.save === save)
    && row.checkId === checkId && row.from === from && row.to === to);

const renamed = (old: string): string => EXPECTED_NAME_CHANGES[old] ?? old;

const ADDED = new Set(EXPECTED_NEW_CHECKS);
const withoutAdded = (completed: readonly string[]): string[] => completed.filter((id) => !ADDED.has(id));

const ADDED_SCREENS = new Set(EXPECTED_SCREEN_ADDITIONS);
const withoutAddedScreens = (screens: readonly string[]): string[] => screens.filter((id) => !ADDED_SCREENS.has(id));

interface PlacementShot {
  locations: Record<string, unknown>;
  spheres: { index: number; locations: string[] }[];
  stats: { locationCount: number; sphereCount: number };
}

const DROPPED = new Set(Object.keys(EXPECTED_DROPPED_LOCATIONS));
const withoutDropped = (placement: unknown): unknown => {
  if (DROPPED.size === 0) return placement;
  const shot = placement as PlacementShot;
  const locations = Object.fromEntries(Object.entries(shot.locations).filter(([key]) => !DROPPED.has(key)));
  const spheres = shot.spheres
    .map((sphere) => sphere.locations.filter((key) => !DROPPED.has(key)))
    .filter((keys) => keys.length > 0)
    .map((keys, index) => ({ index, locations: keys }));
  const stats = { ...shot.stats, locationCount: Object.keys(locations).length, sphereCount: spheres.length };
  return { ...shot, locations, spheres, stats };
};

(ready ? describe : describe.skip)('the net', () => {
  const base = ready ? read(BASE) : ({} as Shot);
  const now = ready ? read(CURRENT) : ({} as Shot);

  it('keeps every save in the corpus', () => {
    expect(Object.keys(now.saves).sort()).toEqual(expect.arrayContaining(Object.keys(base.saves).sort()));
  });

  it('reads the same inventory, the same completions and the same screens', () => {
    const wrong: string[] = [];
    for (const [save, was] of Object.entries(base.saves)) {
      const is = now.saves[save];
      if (is === undefined) { wrong.push(`${save}: missing`); continue; }
      if (JSON.stringify(was.inventory) !== JSON.stringify(is.inventory)) wrong.push(`${save}: inventory`);
      if (JSON.stringify(withoutAdded(was.completed)) !== JSON.stringify(withoutAdded(is.completed))) wrong.push(`${save}: completed`);
      if (EXPECTED_SCREEN_COLUMN_CHANGE) continue;
      if (JSON.stringify(was.reachableScreens) !== JSON.stringify(withoutAddedScreens(is.reachableScreens))) {
        wrong.push(`${save}: reachableScreens`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('moves only the statuses this step declared', () => {
    const moved: string[] = [];
    for (const [save, was] of Object.entries(base.saves)) {
      const is = now.saves[save];
      if (is === undefined) continue;
      for (const [checkId, from] of Object.entries(was.normal)) {
        const to = is.normal[checkId];
        if (to !== from && !allowed(save, checkId, from, to)) moved.push(`normal  ${save}  ${checkId}  ${from} -> ${to}`);
      }
      for (const [seed, shot] of Object.entries(was.seeds)) {
        for (const [checkId, from] of Object.entries(shot.byCheck)) {
          const to = is.seeds[seed]?.byCheck[checkId];
          if (to !== from && !allowed(save, checkId, from, to)) moved.push(`${seed}  ${save}  ${checkId}  ${from} -> ${to}`);
        }
      }
    }
    if (moved.length > 0) writeFileSync(resolve(ROOT, '.user-data/net/moved.txt'), moved.join('\n'));
    expect(moved.slice(0, 40)).toEqual([]);
  });

  it('renames only the names this step declared', () => {
    const wrong: string[] = [];
    for (const [checkId, was] of Object.entries(base.names)) {
      const is = now.names[checkId];
      if (is !== renamed(was)) wrong.push(`${checkId}: ${was} -> ${is}`);
    }
    expect(wrong).toEqual([]);
  });

  it('leaves every seed placement alone unless the step declared it', () => {
    const wrong: string[] = [];
    for (const [seed, was] of Object.entries(base.placements)) {
      if (EXPECTED_PLACEMENT_CHANGES.includes(seed)) continue;
      const wanted = withoutDropped(was);
      if (JSON.stringify(wanted) !== JSON.stringify(now.placements[seed])) wrong.push(seed);
    }
    expect(wrong).toEqual([]);
  });
});
