/* @layer renderer-components @kind types */
interface UseRomManagerParams {
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
  onExtractAssets: (romFile: string) => Promise<boolean>;
}

export type { UseRomManagerParams };
