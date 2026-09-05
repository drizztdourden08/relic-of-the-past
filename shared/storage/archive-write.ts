/* @layer shared-storage @kind logic */
/**
 * ZIP creation via jszip, the write counterpart to ./archive. Two choices, both about very
 * large audio packs:
 * - STORE is the default: gigabytes of Opus or raw PCM do not deflate, so compressing burns
 *   minutes to save nothing. Text entries (a manifest) pass `store: false` and get DEFLATE.
 * - Entries keep their given order and one fixed timestamp, so the output is byte-identical
 *   across runs and a reader can sniff the first entry (a manifest, when put first).
 */
import JSZip from 'jszip';

interface ZipEntry {
  /** Path inside the archive. Forward slashes for a folder, as the format expects. */
  name: string;
  bytes: Uint8Array;
  /** Overrides the call-wide default for this one entry. */
  store?: boolean;
}

interface ZipOptions {
  /** true (the default) = no compression; false = DEFLATE. */
  store?: boolean;
}

/** The earliest instant a ZIP timestamp can hold. Any fixed date would do; the point is that two exports of the same pack agree byte for byte. */
const ZIP_FIXED_DATE = new Date(Date.UTC(1980, 0, 1, 0, 0, 0));

const methodFor = (store: boolean): 'STORE' | 'DEFLATE' => (store ? 'STORE' : 'DEFLATE');

const zipEntries = async (entries: ZipEntry[], options?: ZipOptions): Promise<Uint8Array> => {
  const { store: defaultStore = true } = options ?? {};

  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.name, entry.bytes, {
      binary: true,
      // Folder entries would be emitted ahead of their contents and break "first entry wins".
      createFolders: false,
      date: ZIP_FIXED_DATE,
      compression: methodFor(entry.store ?? defaultStore),
    });
  }

  return zip.generateAsync({ type: 'uint8array', compression: methodFor(defaultStore) });
};

export { zipEntries, ZIP_FIXED_DATE };
export type { ZipEntry, ZipOptions };
