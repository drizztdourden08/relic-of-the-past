/* @layer renderer-lib @kind logic */
import { portSaveStore } from './port-save-store';
import { saveBytes } from './save-bytes';

const readScreenshot = async (p: string, slot: number): Promise<string | null> =>
  saveBytes.toBase64(await portSaveStore.store().slots.readScreenshot(p, portSaveStore.quickRef(slot)));

export { readScreenshot };
