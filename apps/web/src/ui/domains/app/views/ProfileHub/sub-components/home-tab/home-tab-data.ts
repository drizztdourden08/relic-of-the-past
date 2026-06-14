/* @layer renderer-components @kind logic */
/** IPC data fetchers for the Home tab. Each returns null on error (caller keeps prior state). */
import type { NormalSaveInfo, AutoSaveInfo } from '@shared/types/saves';
import type { SlotInfo } from './home-tab.type';
import { QUICK_SAVE_SLOTS } from './home-tab-helpers';

const fetchQuickSlots = async (profileId: string): Promise<SlotInfo[] | null> => {
  try {
    const infos = await window.api.getSlotInfos(profileId);
    const loaded: SlotInfo[] = [];
    for (let i = 0; i < QUICK_SAVE_SLOTS; i++) {
      const info = infos?.find((s: { slot: number }) => s.slot === i);
      let screenshot: string | null = null;
      if (info?.hasScreenshot) {
        try {
          const b64 = await window.api.readScreenshot(profileId, i);
          if (b64) screenshot = `data:image/png;base64,${b64}`;
        } catch { /* ignore */ }
      }
      loaded.push({ slot: i, timestamp: info?.timestamp ?? null, screenshot });
    }
    return loaded;
  } catch { return null; }
};

const fetchNormalSaves = async (profileId: string): Promise<{ list: NormalSaveInfo[]; screenshots: Record<string, string> } | null> => {
  try {
    const list: NormalSaveInfo[] = await window.api.listNormalSaves(profileId);
    // Load screenshots
    const screenshots: Record<string, string> = {};
    for (const save of list) {
      if (save.hasScreenshot) {
        try {
          const b64 = await window.api.loadNormalScreenshot(profileId, save.id);
          if (b64) screenshots[save.id] = `data:image/png;base64,${b64}`;
        } catch { /* ignore */ }
      }
    }
    return { list, screenshots };
  } catch { return null; }
};

const fetchAutoSaves = async (profileId: string): Promise<{ list: AutoSaveInfo[]; screenshots: Record<string, string> } | null> => {
  try {
    const list = await window.api.listAutoSaves(profileId) as AutoSaveInfo[];
    const screenshots: Record<string, string> = {};
    for (const save of list) {
      if (save.hasScreenshot) {
        try {
          const b64 = await window.api.loadAutoScreenshot(profileId, save.id);
          if (b64) screenshots[save.id] = `data:image/png;base64,${b64}`;
        } catch { /* ignore */ }
      }
    }
    return { list, screenshots };
  } catch { return null; }
};

export { fetchQuickSlots, fetchNormalSaves, fetchAutoSaves };
