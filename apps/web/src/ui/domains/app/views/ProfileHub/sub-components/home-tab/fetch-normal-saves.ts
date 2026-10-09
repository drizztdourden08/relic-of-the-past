/* @layer renderer-components @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import * as savesStore from '@app/lib/storage/saves-store';
import { loadScreenshots } from './load-screenshots';
import type { NormalSavesData } from './home-tab.type';

const fetchNormalSaves = async (profileId: string): Promise<NormalSavesData | null> => {
  try {
    const list: NormalSaveInfo[] = await savesStore.listNormalSaves(profileId);
    const screenshots = await loadScreenshots(list, (id) => savesStore.loadNormalScreenshot(profileId, id));
    return { list, screenshots };
  } catch { return null; }
};

export { fetchNormalSaves };
