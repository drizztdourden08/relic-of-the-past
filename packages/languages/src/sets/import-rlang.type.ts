/* @layer shared-storage @kind types */
interface RlangImportOptions {
  desiredId?: string;
  onProgress?: (done: number, total: number) => void;
}

interface RlangImportResult {
  id: string;
  name: string;
}

export type { RlangImportOptions, RlangImportResult };
