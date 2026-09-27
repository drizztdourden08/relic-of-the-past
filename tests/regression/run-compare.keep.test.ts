/* @layer test @kind spec */
/**
 * The gate. Holds the current snapshot to the baseline, allowing exactly the rows
 * expected-changes.data.ts declares and nothing else.
 *
 * Take the baseline before a change with ROTP_NET_LABEL=baseline, the current one after with
 * ROTP_NET_LABEL=current, then run this. Skips itself when either snapshot is absent.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROOT } from './corpus';
import { placementByKey } from './legacy-placement-shot';
import {
  EXPECTED_NAME_CHANGES, EXPECTED_NEW_CHECKS, EXPECTED_PLACEMENT_CHANGES, EXPECTED_SCREEN_ADDITIONS,
  EXPECTED_SCREEN_COLUMN_CHANGE, EXPECTED_STATUS_CHANGES,
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
/**
 * Runs only when a base label is named on the command line. A bare `vitest run` would otherwise
 * compare whatever two snapshots happen to sit in the folder, which is never a step's own reading.
 */
const ready = process.env.ROTP_NET_BASE !== undefined && existsSync(shotPath(BASE)) && existsSync(shotPath(CURRENT));

/** The declared moves, as a set of "save|checkId|from|to" keys; '*' covers every save. */
const allowed = (save: string, checkId: string, from: Status, to: Status): boolean =>
  EXPECTED_STATUS_CHANGES.some((row) => (row.save === '*' || row.save === save)
    && row.checkId === checkId && row.from === from && row.to === to);

const renamed = (old: string): string => EXPECTED_NAME_CHANGES[old] ?? old;

/**
 * The completions a step added records for, dropped from the current reading so the rest can be
 * held to the baseline exactly. A step that adds no record declares none, and then every
 * completion has to match.
 */
const ADDED = new Set(EXPECTED_NEW_CHECKS);
const withoutAdded = (completed: readonly string[]): string[] => completed.filter((id) => !ADDED.has(id));

/**
 * The screens a step declared the column may gain, dropped from the current reading so the rest
 * of it is held to the baseline exactly. Nothing may LEAVE the column this way: a screen that
 * stops being reachable is a loss and gets read, never declared.
 */
const ADDED_SCREENS = new Set(EXPECTED_SCREEN_ADDITIONS);
const withoutAddedScreens = (screens: readonly string[]): string[] => screens.filter((id) => !ADDED_SCREENS.has(id));

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
      // The screen column moves only for a step that says so, and only a step that changes how
      // the column is DERIVED may say it: a per-row difference is never allowed through here.
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
    // A placement is compared BY ID, which is the only reading a relabel cannot move. A
    // baseline older than that change speaks names, so it is read into those keys first
    // (legacy-placement-shot.ts).
    const idByName = new Map(Object.entries(now.names).map(([checkId, name]) => [name, checkId]));
    const wrong: string[] = [];
    for (const [seed, was] of Object.entries(base.placements)) {
      if (EXPECTED_PLACEMENT_CHANGES.includes(seed)) continue;
      const wanted = placementByKey(was, idByName, renamed);
      if (JSON.stringify(wanted) !== JSON.stringify(now.placements[seed])) wrong.push(seed);
    }
    expect(wrong).toEqual([]);
  });
});
