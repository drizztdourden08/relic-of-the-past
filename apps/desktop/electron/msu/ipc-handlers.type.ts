/* @layer electron-main @kind types */
type MsuImportResult = {
  success: boolean;
  fileCount?: number;
  error?: string;
  skippedNested?: number;
  skippedDuplicate?: number;
};

type MsuPackSummary = { name: string; fileCount: number; totalSize: number };

export type { MsuImportResult, MsuPackSummary };
