/* @layer renderer-lib @kind logic */
import { portSaveStore } from './port-save-store';
import { saveBytes } from './save-bytes';

const writeState = async (p: string, slot: number, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<void> => {
  const bytes = await saveBytes.stamped(data);
  await portSaveStore.store().slots.write(p, portSaveStore.quickRef(slot), { bytes, screenshot: saveBytes.optional(screenshot) });
};

export { writeState };
