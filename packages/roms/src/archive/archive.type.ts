/* @layer shared-storage @kind types */
interface ArchiveEntry {
  name: string;
  bytes: Uint8Array;
}

export type { ArchiveEntry };
