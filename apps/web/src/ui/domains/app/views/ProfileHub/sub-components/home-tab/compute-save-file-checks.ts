/* @layer renderer-components @kind logic */
/**
 * Per-save-file checks readout, computed OFFLINE from the profile's battery
 * save on disk. Two ways to rate a file, matching the Checks widget:
 * a randomized profile rates it against its seed's frozen placement, and a
 * Vanilla profile rates it against the vanilla rules with the file's own
 * inventory. One row per save file that holds a valid game.
 */
import { all } from '@shared/game/data';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules } from '@shared/game/logic/resolver';
import { VANILLA_CONFIG } from '@shared/game/data/presets';
import * as savesStore from '@app/lib/storage/saves-store';
import { loadRandomizerPlacement } from '@app/lib/randomizer-placement-io';
import { offlineCompletedChecks } from '@app/lib/game/save-file/offline-progress';
import { offlineInventory } from '@app/lib/game/save-file/offline-inventory';
import { offlinePlayerName } from '@app/lib/game/save-file/offline-player-name';
import { SRAM_SLOT_COUNT } from '@app/lib/game/save-file/sram-slots';
import { armedCheckIdsOfPlacement, computeApTrackerSnapshot } from '@app/lib/game/randomizer-client';
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { SaveFileChecks } from './home-tab.type';

type CheckStatusMap = Map<CheckId, string>;
/** Rates one slot; null when the slot holds no valid game. */
type RateSlot = (sram: Uint8Array, slot: number, checks: readonly CheckRecord[]) => CheckStatusMap | null;

const countStatuses = (slot: number, name: string | null, snapshot: CheckStatusMap): SaveFileChecks => {
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

const rateAgainstVanillaRules = (): RateSlot => {
  const rules = resolveRules(VANILLA_CONFIG);
  const neverArmed = (): boolean => false;
  return (sram, slot, checks) => {
    const completed = offlineCompletedChecks(sram, slot, neverArmed);
    const owned = offlineInventory(sram, slot);
    if (!completed || !owned) return null;
    const inventory = new Set([...rules.startInventory, ...owned]);
    return computeTrackerSnapshot(inventory, completed, checks, rules.connections, rules.checkOverrides);
  };
};

const rateAgainstPlacement = async (profileId: string): Promise<RateSlot | null> => {
  const placement = await loadRandomizerPlacement(profileId);
  if (!placement) return null;
  const armed = armedCheckIdsOfPlacement(placement);
  const isArmed = (checkId: string): boolean => armed.has(checkId);
  return (sram, slot, checks) => {
    const completed = offlineCompletedChecks(sram, slot, isArmed);
    return completed ? computeApTrackerSnapshot(placement, completed, checks) : null;
  };
};

const computeSaveFileChecks = async (
  profileId: string,
  isRandomized: boolean,
): Promise<SaveFileChecks[] | null> => {
  const [sramBuf, rate] = await Promise.all([
    savesStore.readSram(profileId),
    isRandomized ? rateAgainstPlacement(profileId) : rateAgainstVanillaRules(),
  ]);
  if (!sramBuf || !rate) return null;

  const sram = new Uint8Array(sramBuf);
  const checks = all('check');
  const rows: SaveFileChecks[] = [];
  for (let slot = 0; slot < SRAM_SLOT_COUNT; slot++) {
    const snapshot = rate(sram, slot, checks);
    if (snapshot) rows.push(countStatuses(slot, offlinePlayerName(sram, slot), snapshot));
  }
  return rows.length > 0 ? rows : null;
};

export { computeSaveFileChecks };
