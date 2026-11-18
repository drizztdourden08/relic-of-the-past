/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { isZip, unzip } from '@rotp/roms';
import { itemAt } from '@app/checked-access';
import { LocalizedError } from '../localized-error';
import { ROM_FILE_PATTERN } from './languages-store.constants';

const resolveRomBytes = async (bytes: Uint8Array): Promise<Uint8Array> => {
  if (!isZip(bytes)) return bytes;
  const roms = (await unzip(bytes)).filter((e) => ROM_FILE_PATTERN.test(e.name));
  if (roms.length === 0) throw new LocalizedError(msg('errors:rom.zip.none'));
  if (roms.length > 1) throw new LocalizedError(msg('errors:rom.zip.many', { count: roms.length }));
  return itemAt(roms, 0).bytes;
};

export { resolveRomBytes };
