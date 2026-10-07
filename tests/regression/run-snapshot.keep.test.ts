/* @layer test @kind spec */
/**
 * Records what every save in the corpus reports, so a later run can be held to it. Everything
 * is keyed BY ID, never by name, so a rename cannot hide a behaviour change. The `names` map is
 * the one name column, and it is compared as a column of its own.
 *
 * Writes .user-data/net/<ROTP_NET_LABEL>.json. Reads saves, never writes one. Run it with
 * ROTP_NET_LABEL=baseline before a change and ROTP_NET_LABEL=current after, then run
 * run-compare.test.ts.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { find } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import { computePlacementAvailability } from '@shared/randomizer/placement-availability';
import { buildNormalPlacement } from '@shared/randomizer/normal-placement';
import { computeCompletedChecks } from '@app/lib/game/tracker/completed-checks-core';
import { PROGRESS_OFFSETS } from '@app/lib/game/save-file/progress-offsets';
import { SRM_EVENT_LEDGER } from '@app/lib/game/save-file/hook-save-bytes';
import { inventoryToItemSet, parseInventoryBuffer } from '@app/lib/game/tracker/inventory';
import { Core } from '../story-events/core-harness';
import { CORPUS_SEEDS, ROOT, corpusSaves } from './corpus';

(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { trackerReachableScreens, trackerStatuses } = await import('@app/lib/game/tracker/tracker-statuses');
const { standardCheckName } = await import('@app/lib/game/randomizer-client/check-names');

/** The snapshot's name. Unset means a bare `vitest run`, which writes nothing: a label is a step's own reading. */
const LABEL = process.env.ROTP_NET_LABEL ?? '';
const JS = resolve(ROOT, 'apps/web/public/wasm/zelda3.js');
const OUT_DIR = resolve(ROOT, '.user-data/net');
const BLOCK = 0xf000;
/** The tracker query export and the default story word, as the app arms them. */
const GATE_TRACKER_QUERIES = 1024;
const GATE_STORY_WORD = 0x2e00006;

const sorted = <T,>(entries: Iterable<[string, T]>): Record<string, T> =>
  Object.fromEntries([...entries].sort(([a], [b]) => (a < b ? -1 : 1)));

(LABEL ? it : it.skip)('records what every save reports', async () => {
  const checks = find('check', () => true);
  const placements = sorted(Object.entries(CORPUS_SEEDS).map(([name, make]) => [name, make()]));
  // Normal reads through the same engine as a seed, over the placement where nothing moved.
  const normal = buildNormalPlacement();
  const saves: Record<string, unknown> = {};

  for (const { name, path } of corpusSaves()) {
    const core = await Core.load(JS, 'state');
    core.call('WasmSetGateWord', 3, GATE_TRACKER_QUERIES);
    core.call('WasmSetGateWord', 5, GATE_STORY_WORD);
    core.loadFixtureFile(path);
    core.frames(1);

    const inventory = inventoryToItemSet(parseInventoryBuffer(core.heap(core.call('WasmGetInventoryState'), 40), 0));
    const completed = computeCompletedChecks({
      readRoomWord: (room) => core.get16(BLOCK + room * 2),
      readOwByte: (screen) => core.get8(BLOCK + 0x280 + screen),
      readProgByte: (i) => { const off = PROGRESS_OFFSETS[i]; return off === null || off === undefined ? 0 : core.get8(BLOCK + off); },
      readEventByte: (i) => core.get8(SRM_EVENT_LEDGER + i),
      inventory,
    }, () => false);

    const normalRun = { placement: normal, checks, inventory, completed: completed as ReadonlySet<CheckId> };

    saves[name] = {
      inventory: [...inventory].sort(),
      completed: [...completed].sort(),
      normal: sorted(trackerStatuses(normalRun)),
      // The screens the one engine's regions come out to, which is where a record-read row happens.
      reachableScreens: [...trackerReachableScreens(normalRun)].sort(),
      seeds: sorted(Object.entries(placements).map(([seed, placement]) => [seed, {
        byCheck: sorted(trackerStatuses({
          placement, checks, inventory, completed: completed as ReadonlySet<CheckId>,
        })),
        // The ledger goes in, because every path the app takes hands it over: without it an act
        // reads as done the moment the means to do it are in reach, which nothing else does.
        available: [...computePlacementAvailability(placement, completed, true, new Set(), completed)].sort(),
      }])),
    };
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const names = sorted(checks.map((check) => [check.id, standardCheckName(check.id)]));
  writeFileSync(resolve(OUT_DIR, `${LABEL}.json`), JSON.stringify({ names, placements, saves }, null, 1));
  expect(Object.keys(saves).length).toBeGreaterThan(0);
}, 900000);
