/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { alttpMsuConfig, msu } from '@rotp/msu';
import { LocalizedError } from '../localized-error';
import { platformFiles } from '../platform-files';

const readMsuTrackFile = async (pack: string, fileName: string): Promise<ArrayBuffer> => {
  const bytes = await msu.readTrackFile(alttpMsuConfig, platformFiles(), pack, fileName);
  if (!bytes) throw new LocalizedError(msg('errors:msu.trackNotFound', { file: fileName }));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

export { readMsuTrackFile };
