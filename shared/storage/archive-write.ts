/* @layer shared-storage @kind logic */
/**
 * ZIP creation via jszip — the write counterpart to ./archive, kept in its own module so the
 * read path stays a pure reader.
 *
 * Two deliberate choices, both about very large audio packs:
 *
 * - STORE is the default. A pack is gigabytes of Opus or raw PCM, neither of which deflates
 *   usefully, so compressing it burns minutes to save nothing. Text entries (a manifest) pass
 *   `store: false` and get DEFLATE, which is where the ratio actually pays.
 * - Entries keep the order they were given, and every entry is stamped with one fixed
 *   timestamp. Together those make the output byte-identical across runs, so re-exporting an
 *   unchanged pack produces an unchanged file — and a reader can sniff the first entry
 *   (a manifest, when the caller puts it first) without scanning the whole archive.
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

/**
 * The earliest instant a ZIP timestamp can hold. Any fixed date would do — the point is that
 * it does not come from the clock, so two exports of the same pack agree byte for byte.
 */
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
