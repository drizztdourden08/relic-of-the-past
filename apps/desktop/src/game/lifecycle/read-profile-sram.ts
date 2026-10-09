/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';

const readProfileSram = async (profileId?: string): Promise<Uint8Array | null> => {
  if (!profileId) return null;
  const buffer = await savesStore.readSram(profileId);
  if (!buffer) return null;
  const sramData = new Uint8Array(buffer);
  log.app(`Loaded SRAM from profile (${sramData.byteLength} bytes)`);
  return sramData;
};

export { readProfileSram };
