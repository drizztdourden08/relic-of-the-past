/* @layer electron-main @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { createRotpSaveStore } from '@app/storage/save-files';
import type { QuickSlot } from './bug-report.type';

const collectQuickSlots = async (files: FileStore, profileId: string): Promise<QuickSlot[]> => {
  const { slots } = createRotpSaveStore(files);
  const slotsOut: QuickSlot[] = [];
  for (const { slot, savedAt } of await slots.listQuick(profileId)) {
    const bytes = await slots.read(profileId, { kind: 'quick', slot });
    if (bytes) slotsOut.push({ slot, savedAt, bytes });
  }
  return slotsOut;
};

export { collectQuickSlots };
