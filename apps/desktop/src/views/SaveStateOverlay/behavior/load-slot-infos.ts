/* @layer renderer-components @kind logic */
import * as savesStore from '@app/storage/saves-store';
import { SLOT_COUNT } from '../SaveStateOverlay.constants';
import type { SlotInfo } from '../SaveStateOverlay.type';
import { screenshotUrlOf } from './screenshot-url-of';

const loadSlotInfos = async (profileId: string): Promise<SlotInfo[]> => {
  const infos = await savesStore.getSlotInfos(profileId);

  const slotData: SlotInfo[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const info = infos.find((s) => s.slot === i);
    slotData.push({
      slot: i,
      timestamp: info?.timestamp ?? 0,
      size: info?.size ?? 0,
      hasScreenshot: info?.hasScreenshot ?? false,
      screenshotUrl: await screenshotUrlOf(profileId, i, info?.hasScreenshot ?? false),
    });
  }
  return slotData;
};

export { loadSlotInfos };
