/* @layer test @kind spec */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { find } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import { computePlacementAvailability, buildNormalPlacement } from '@rotp/randomizer';
import { computeCompletedChecks, inventoryToItemSet, parseInventoryBuffer } from '@rotp/navigation';
import { PROGRESS_OFFSETS, SRM_EVENT_LEDGER } from '@rotp/game-core';
import { Core } from '../story-events/core-harness';
import { CORPUS_SEEDS, ROOT, corpusSaves } from './corpus';

(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { trackerReachableScreens, trackerStatuses } = await import('@rotp/navigation');
const { standardCheckName } = await import('@rotp/randomizer');

const LABEL = process.env.ROTP_NET_LABEL ?? '';
const JS = resolve(ROOT, 'apps/desktop/public/wasm/zelda3.js');
const OUT_DIR = resolve(ROOT, '.user-data/net');
const BLOCK = 0xf000;
const GATE_TRACKER_QUERIES = 1024;
const GATE_STORY_WORD = 0x2e00006;

const sorted = <T,>(entries: Iterable<[string, T]>): Record<string, T> =>
  Object.fromEntries([...entries].sort(([a], [b]) => (a < b ? -1 : 1)));

(LABEL ? it : it.skip)('records what every save reports', async () => {
  const checks = find('check', () => true);
  const placements = sorted(Object.entries(CORPUS_SEEDS).map(([name, make]) => [name, make()]));
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
      reachableScreens: [...trackerReachableScreens(normalRun)].sort(),
      seeds: sorted(Object.entries(placements).map(([seed, placement]) => [seed, {
        byCheck: sorted(trackerStatuses({
          placement, checks, inventory, completed,
        })),
        available: [...computePlacementAvailability(placement, completed, true, new Set(), completed)].sort(),
      }])),
    };
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const names = sorted(checks.map((check) => [check.id, standardCheckName(check.id)]));
  writeFileSync(resolve(OUT_DIR, `${LABEL}.json`), JSON.stringify({ names, placements, saves }, null, 1));
  expect(Object.keys(saves).length).toBeGreaterThan(0);
}, 900000);
