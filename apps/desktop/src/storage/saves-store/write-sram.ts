/* @layer renderer-lib @kind logic */
import { portSaveStore } from './port-save-store';
import { saveBytes } from './save-bytes';

const writeSram = (p: string, data: ArrayBuffer): Promise<void> => portSaveStore.store().sram.write(p, saveBytes.u8(data));

export { writeSram };
