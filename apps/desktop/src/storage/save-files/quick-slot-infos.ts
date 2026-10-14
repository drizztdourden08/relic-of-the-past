/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { QuickSaveSlotInfo } from '@rotp/game-core';
import { createRotpSaveStore } from './rotp-save-store';
import { QUICK_SLOTS } from './save-files.constants';
import { stateSize } from './state-size';

const quickSlotInfos = async (files: FileStore, p: string): Promise<QuickSaveSlotInfo[]> => {
  const listed = (await createRotpSaveStore(files).slots.listQuick(p)).filter((info) => info.slot < QUICK_SLOTS);
  const infos = await Promise.all(listed.map(async ({ slot, savedAt, hasScreenshot }) => {
    const size = await stateSize(files, p, { kind: 'quick', slot });
    return size === null ? null : { slot, timestamp: savedAt, size, hasScreenshot };
  }));
  return infos.filter((info) => info !== null);
};

export { quickSlotInfos };
