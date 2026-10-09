/* @layer shared-storage @kind types */
interface InstallOptions {
  desiredName?: string;
  onProgress?: (done: number, total: number) => void;
}

interface InstallResult {
  pack: string;
  ownName: string;
  fileCount: number;
  trackCount: number;
  missingFiles: string[];
}

export type { InstallOptions, InstallResult };
