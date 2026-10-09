/* @layer electron-main @kind types */
type MsuImportResult = {
  success: boolean;
  fileCount?: number;
  error?: string;
  skippedNested?: number;
  skippedDuplicate?: number;
};

export type { MsuImportResult };
