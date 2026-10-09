/* @layer renderer-lib @kind logic */
import { portSaveStore } from './port-save-store';
import { saveBytes } from './save-bytes';

const readSram = async (p: string): Promise<ArrayBuffer | null> => saveBytes.toArrayBuffer(await portSaveStore.store().sram.read(p));

export { readSram };
