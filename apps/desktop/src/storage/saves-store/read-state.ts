/* @layer renderer-lib @kind logic */
import { portSaveStore } from './port-save-store';
import { saveBytes } from './save-bytes';

const readState = async (p: string, slot: number): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await portSaveStore.store().slots.read(p, portSaveStore.quickRef(slot)));

export { readState };
