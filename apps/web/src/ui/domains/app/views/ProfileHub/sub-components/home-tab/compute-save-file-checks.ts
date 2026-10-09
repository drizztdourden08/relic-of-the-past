/* @layer renderer-components @kind logic */
import { all } from '@shared/game/data';
import type { RunKind } from '@shared/game/logic';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import * as savesStore from '@app/lib/storage/saves-store';
import { loadRandomizerPlacement } from '@app/lib/randomizer-placement-io';
import { offlineCompletedChecks } from '@app/lib/game/save-file/offline-progress';
import { offlinePlayerName } from '@app/lib/game/save-file/offline-player-name';
import { SRAM_SLOT_COUNT } from '@app/lib/game/save-file/sram-slots';
import { normalPlacement } from '@app/lib/game/tracker/normal-placement-ref';
import { armedCheckIdsOfPlacement, computeTrackerSnapshot } from '@app/lib/game/randomizer-client';
import type { CheckId } from '@shared/game/data';
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
