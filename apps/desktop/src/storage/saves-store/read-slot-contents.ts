/* @layer renderer-lib @kind logic */
import type { SaveSlotRef } from '@drizztdourden08/brock-port-kit';
import { readMsuResume } from '../msu-store';
import { msuKeyOf } from './msu-key-of';
import { portSaveStore } from './port-save-store';
import type { SlotContents } from './slot-contents.type';

const readSlotContents = async (p: string, ref: SaveSlotRef): Promise<SlotContents | null> => {
  const slots = portSaveStore.store().slots;
  const bytes = await slots.read(p, ref);
  if (!bytes) return null;
  const { kind, id } = msuKeyOf(ref);
  const [screenshot, music] = await Promise.all([slots.readScreenshot(p, ref), readMsuResume(p, kind, id)]);
  return { bytes, screenshot, music };
};

export { readSlotContents };
