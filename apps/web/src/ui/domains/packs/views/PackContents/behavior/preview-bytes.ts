/* @layer renderer-components @kind logic */
/**
 * The bytes a preview plays. An MSU-1 `.pcm` plays its first 30 seconds, read straight from the
 * pack (the header, then 16-bit stereo at 44100 Hz). Any other audio has to be decoded whole, so
 * it is read whole up to 48 MiB and refused above that.
 */
import { entryData } from '@shared/store/manifest/zip-directory';
import type { ZipEntry } from '@shared/store/manifest/zip-directory';
import { MSU1_BYTES_PER_FRAME, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE } from '@shared/types/msu1-format';
import type { PackSource } from '../../../pack-source.type';

const PREVIEW_SECONDS = 30;
const PCM_PREVIEW_BYTES = MSU1_HEADER_BYTES + MSU1_SAMPLE_RATE * MSU1_BYTES_PER_FRAME * PREVIEW_SECONDS;
const MAX_PREVIEW_BYTES = 48 * 1024 * 1024;

const TOO_LARGE = 'Too large to preview.';

const isPcm = (name: string): boolean => /\.pcm$/i.test(name);

/** The bytes to decode for `entry`, or throws `TOO_LARGE` for encoded audio past the cap. */
const previewBytes = (source: PackSource, entry: ZipEntry): Promise<Uint8Array> => {
  if (isPcm(entry.name)) return entryData(source, entry, PCM_PREVIEW_BYTES);
  if (entry.bytes > MAX_PREVIEW_BYTES) return Promise.reject(new Error(TOO_LARGE));
  return entryData(source, entry);
};

export { previewBytes, PCM_PREVIEW_BYTES, MAX_PREVIEW_BYTES, TOO_LARGE };
