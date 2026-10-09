/* @layer shared-storage @kind types */
interface ZipEntry {
  name: string;
  bytes: Uint8Array;
  store?: boolean;
}

interface ZipOptions {
  store?: boolean;
}

export type { ZipEntry, ZipOptions };
