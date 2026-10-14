/* @layer renderer-components @kind logic */
import * as savesStore from '@app/storage/saves-store';
import { QUICK_SAVE_SLOTS } from './home-tab.constants';
import type { SlotInfo } from './home-tab.type';

const readSlotScreenshot = async (profileId: string, slot: number): Promise<string | null> => {
  try {
    const b64 = await savesStore.readScreenshot(profileId, slot);
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch {
    return null;
  }
};

const fetchQuickSlots = async (profileId: string): Promise<SlotInfo[] | null> => {
  try {
    const infos = await savesStore.getSlotInfos(profileId);
    const loaded: SlotInfo[] = [];
    for (let i = 0; i < QUICK_SAVE_SLOTS; i++) {
      const info = infos.find((s: { slot: number }) => s.slot === i);
      const screenshot = info?.hasScreenshot ? await readSlotScreenshot(profileId, i) : null;
      loaded.push({ slot: i, timestamp: info?.timestamp ?? null, screenshot });
    }
    return loaded;
  } catch { return null; }
};

export { fetchQuickSlots };
