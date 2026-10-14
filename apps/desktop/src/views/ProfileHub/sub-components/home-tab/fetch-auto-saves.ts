/* @layer renderer-components @kind logic */
import * as savesStore from '@app/storage/saves-store';
import { loadScreenshots } from './load-screenshots';
import type { AutoSavesData } from './home-tab.type';

const fetchAutoSaves = async (profileId: string): Promise<AutoSavesData | null> => {
  try {
    const list = await savesStore.listAutoSaves(profileId);
    const screenshots = await loadScreenshots(list, (id) => savesStore.loadAutoScreenshot(profileId, id));
    return { list, screenshots };
  } catch { return null; }
};

export { fetchAutoSaves };
