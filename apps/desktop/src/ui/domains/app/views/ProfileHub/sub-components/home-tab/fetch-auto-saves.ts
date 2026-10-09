/* @layer renderer-components @kind logic */
import type { AutoSaveInfo } from '@rotp/game-core';
import * as savesStore from '@app/lib/storage/saves-store';
import { loadScreenshots } from './load-screenshots';
import type { AutoSavesData } from './home-tab.type';

const fetchAutoSaves = async (profileId: string): Promise<AutoSavesData | null> => {
  try {
    const list = await savesStore.listAutoSaves(profileId) as AutoSaveInfo[];
    const screenshots = await loadScreenshots(list, (id) => savesStore.loadAutoScreenshot(profileId, id));
    return { list, screenshots };
  } catch { return null; }
};

export { fetchAutoSaves };
