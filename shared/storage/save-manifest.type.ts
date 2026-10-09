/* @layer shared-storage @kind types */
interface ManifestEntry {
  id: string;
  timestamp: number;
}

type ValidManifestEntry<T extends ManifestEntry> = { entry: T; bytes: number; hasScreenshot: boolean };

export type { ManifestEntry, ValidManifestEntry };
