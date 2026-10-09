/* @layer shared-storage @kind logic */
import JSZip from 'jszip';
import { ZIP_FIXED_DATE } from './archive-write.constants';
import type { ZipEntry, ZipOptions } from './archive-write.type';

const methodFor = (store: boolean): 'STORE' | 'DEFLATE' => (store ? 'STORE' : 'DEFLATE');

const zipEntries = async (entries: ZipEntry[], options?: ZipOptions): Promise<Uint8Array> => {
  const { store: defaultStore = true } = options ?? {};

  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.name, entry.bytes, {
      binary: true,
      createFolders: false,
      date: ZIP_FIXED_DATE,
      compression: methodFor(entry.store ?? defaultStore),
    });
  }

  return zip.generateAsync({ type: 'uint8array', compression: methodFor(defaultStore) });
};

export { zipEntries };
export type { ZipEntry, ZipOptions };
