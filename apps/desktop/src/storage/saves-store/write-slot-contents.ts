/* @layer renderer-lib @kind logic */
import type { SaveSlotRef } from '@drizztdourden08/brock-port-kit';
import { writeMsuResume } from '../msu-store';
import { msuKeyOf } from './msu-key-of';
import { portSaveStore } from './port-save-store';
import type { SlotContents } from './slot-contents.type';

const writeSlotContents = async (p: string, ref: SaveSlotRef, contents: SlotContents | null): Promise<void> => {
  const slots = portSaveStore.store().slots;
  if (!contents) {
    await slots.remove(p, ref);
    return;
  }
  const { bytes, screenshot, music } = contents;
  await slots.write(p, ref, { bytes, screenshot });
  const { kind, id } = msuKeyOf(ref);
  if (music) await writeMsuResume(p, kind, id, music);
};

export { writeSlotContents };
