/* @layer bridge-wasm @kind logic */
import * as savesStore from '../../storage/saves-store';
import { saveOnQuit } from '../auto-save';
import { getProfileId, lifecycleState } from '@rotp/game-core';

const saveBeforeQuit = async (): Promise<void> => {
  const config = lifecycleState.activeAutoSaveConfig;
  if (!config?.saveOnQuit) return;
  try {
    await saveOnQuit();
    const profileId = getProfileId();
    if (config.maxEntries && profileId) await savesStore.pruneAutoSaves(profileId, config.maxEntries);
  } catch {
    return;
  }
};

export { saveBeforeQuit };
