/* @layer renderer-components @kind types */
interface UseRomManagerParams {
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
  onExtractAssets: (romFile: string) => Promise<boolean>;
}

interface RomImportOutcome {
  success: boolean;
  message: string;
  id?: string;
}

export type { RomImportOutcome, UseRomManagerParams };
