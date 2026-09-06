/* @layer renderer-components @kind hook */
/**
 * Per-save-file checks readout for the home header, computed OFFLINE from
 * the profile's battery save on disk — no running game required, so it can
 * never show the live subscription's false zero. One row per save file that
 * holds a valid game, with the same taken / available / left semantics the
 * Checks widget derives for a randomized profile (the shared availability
 * snapshot over this seed's frozen placement). Recomputes on mount, on
 * profile change, and when a session ends (isGameRunning flips false); while
 * a game runs it keeps the pre-session readout instead of polling.
 */
import { useEffect, useState } from 'react';
import { all } from '@shared/game/data';
import * as savesStore from '@app/lib/storage/saves-store';
import { loadRandomizerPlacement } from '@app/lib/randomizer-placement-io';
import { offlineCompletedChecks } from '@app/lib/game/save-file/offline-progress';
import { SRAM_SLOT_COUNT } from '@app/lib/game/save-file/sram-slots';
import { armedCheckIdsOfPlacement, computeApTrackerSnapshot } from '@app/lib/game/randomizer-client';
import type { SaveFileChecks } from './home-tab.type';

const computeSaveFileChecks = async (profileId: string): Promise<SaveFileChecks[] | null> => {
  const [sramBuf, placement] = await Promise.all([
    savesStore.readSram(profileId),
    loadRandomizerPlacement(profileId),
  ]);
  if (!sramBuf || !placement) return null;

  const sram = new Uint8Array(sramBuf);
  const armed = armedCheckIdsOfPlacement(placement);
  const isArmed = (checkId: string): boolean => armed.has(checkId);
  const checkRecords = all('check');

  const rows: SaveFileChecks[] = [];
  for (let slot = 0; slot < SRAM_SLOT_COUNT; slot++) {
    const completed = offlineCompletedChecks(sram, slot, isArmed);
    if (completed === null) continue; // empty or corrupt slot
    const snapshot = computeApTrackerSnapshot(placement, completed, checkRecords);
    let taken = 0;
    let available = 0;
    let left = 0;
    for (const status of snapshot.values()) {
      if (status === 'completed') taken++;
      else if (status === 'reachable') available++;
      else left++;
    }
    rows.push({ slot, taken, available, left, total: snapshot.size });
  }
  return rows.length > 0 ? rows : null;
};

const useHomeSaveFileChecks = (
  profileId: string,
  isRandomized: boolean,
  isGameRunning: boolean,
): SaveFileChecks[] | null => {
  const [files, setFiles] = useState<SaveFileChecks[] | null>(null);

  useEffect(() => {
    if (!isRandomized) {
      setFiles(null);
      return;
    }
    if (isGameRunning) return; // keep the pre-session readout until the session ends
    let cancelled = false;
    computeSaveFileChecks(profileId)
      .then((rows) => { if (!cancelled) setFiles(rows); })
      .catch(() => { if (!cancelled) setFiles(null); });
    return () => { cancelled = true; };
  }, [profileId, isRandomized, isGameRunning]);

  return files;
};

export { useHomeSaveFileChecks };
