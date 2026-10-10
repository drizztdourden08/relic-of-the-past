/* @layer renderer-lib @kind logic */
import { isZip, unzip } from '@rotp/roms';
import { itemAt } from '@app/checked-access';
import { ROM_FILE_PATTERN } from './languages-store.constants';

const resolveRomBytes = async (bytes: Uint8Array): Promise<Uint8Array> => {
  if (!isZip(bytes)) return bytes;
  const roms = (await unzip(bytes)).filter((e) => ROM_FILE_PATTERN.test(e.name));
  if (roms.length === 0) throw new Error('No ROM file (.sfc/.smc) found in the source');
  if (roms.length > 1) throw new Error(`Multiple ROM files found (${roms.length}). Provide exactly one ROM.`);
  return itemAt(roms, 0).bytes;
};

export { resolveRomBytes };
