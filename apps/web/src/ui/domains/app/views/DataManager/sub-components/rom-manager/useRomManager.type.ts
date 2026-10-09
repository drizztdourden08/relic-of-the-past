/* @layer renderer-components @kind types */
interface UseRomManagerParams {
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
  onExtractAssets: (romFile: string) => void;
}

export type { UseRomManagerParams };
