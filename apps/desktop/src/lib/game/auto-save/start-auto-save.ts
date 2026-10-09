/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';
import { getProfileId } from '@rotp/game-core';
import { MAX_INTERVAL_SECONDS, MIN_INTERVAL_SECONDS } from '@rotp/game-core';
import { autoSaveState } from '@rotp/game-core';
import { notifyAutoSavesChanged } from '@rotp/game-core';
import { performAutoSave } from './perform-auto-save';
import { stopAutoSave } from '@rotp/game-core';

const pruneIfNeeded = async (maxEntries: number): Promise<void> => {
  const profileId = getProfileId();
  if (!profileId) return;
  try {
    await savesStore.pruneAutoSaves(profileId, maxEntries);
  } catch {
    return;
  }
};

const startAutoSave = (intervalSeconds: number, maxEntries: number): void => {
  stopAutoSave();
  const intervalMs = Math.max(MIN_INTERVAL_SECONDS, Math.min(MAX_INTERVAL_SECONDS, intervalSeconds)) * 1000;
  log.app(`[AutoSave] Starting timer (interval=${intervalSeconds}s, max=${maxEntries})`);

  autoSaveState.interval = setInterval(async () => {
    const success = await performAutoSave('timer');
    if (success) {
      await pruneIfNeeded(maxEntries);
      notifyAutoSavesChanged();
    }
  }, intervalMs);
};

export { startAutoSave };
