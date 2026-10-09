/* @layer renderer-components @kind logic */
import { all } from '@rotp/game-data';
import type { RunKind, CheckId } from '@rotp/game-data';
import type { Placement } from '@rotp/randomizer';
import * as savesStore from '@app/storage/saves-store';
import { loadRandomizerPlacement } from '@app/randomizer-placement-io';
import { offlineCompletedChecks, normalPlacement } from '@rotp/navigation';
import { offlinePlayerName, SRAM_SLOT_COUNT } from '@rotp/game-core';
import { armedCheckIdsOfPlacement, computeTrackerSnapshot } from '@app/game/randomizer-client';
import type { SaveFileChecks } from './home-tab.type';

const countStatuses = (slot: number, name: string | null, snapshot: ReadonlyMap<CheckId, string>): SaveFileChecks => {
  let taken = 0;
  let available = 0;
  let left = 0;
  for (const status of snapshot.values()) {
    if (status === 'completed') taken++;
    else if (status === 'reachable') available++;
    else left++;
  }
  return { slot, name, taken, available, left, total: snapshot.size };
};

const placementFor = async (profileId: string, runKind: RunKind): Promise<Placement | null> => {
  if (runKind === 'online') return null;
  return runKind === 'seed' ? loadRandomizerPlacement(profileId) : normalPlacement();
};

const computeSaveFileChecks = async (profileId: string, runKind: RunKind): Promise<SaveFileChecks[] | null> => {
  const [sramBuf, placement] = await Promise.all([
    savesStore.readSram(profileId),
    placementFor(profileId, runKind),
  ]);
  if (!sramBuf || !placement) return null;

  const sram = new Uint8Array(sramBuf);
  const armed = armedCheckIdsOfPlacement(placement);
  const isArmed = (checkId: string): boolean => armed.has(checkId);
  const checks = all('check');
  const rows: SaveFileChecks[] = [];
  for (let slot = 0; slot < SRAM_SLOT_COUNT; slot++) {
    const completed = offlineCompletedChecks(sram, slot, isArmed);
    if (completed === null) continue;
    const snapshot = computeTrackerSnapshot(placement, completed, checks);
    rows.push(countStatuses(slot, offlinePlayerName(sram, slot), snapshot));
  }
  return rows.length > 0 ? rows : null;
};

export { computeSaveFileChecks };
