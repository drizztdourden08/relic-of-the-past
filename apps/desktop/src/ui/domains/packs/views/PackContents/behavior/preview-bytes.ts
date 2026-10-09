/* @layer renderer-components @kind logic */
import { entryData } from '@rotp/hub-contracts';
import type { ZipEntry } from '@rotp/hub-contracts';
import type { PackSource } from '../../../pack-source.type';
import { MAX_PREVIEW_BYTES, PCM_PREVIEW_BYTES, TOO_LARGE } from '../PackContents.constants';

const isPcm = (name: string): boolean => /\.pcm$/i.test(name);

const previewBytes = (source: PackSource, entry: ZipEntry): Promise<Uint8Array> => {
  if (isPcm(entry.name)) return entryData(source, entry, PCM_PREVIEW_BYTES);
  if (entry.bytes > MAX_PREVIEW_BYTES) return Promise.reject(new Error(TOO_LARGE));
  return entryData(source, entry);
};

export { previewBytes };
