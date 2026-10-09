/* @layer renderer-components @kind types */
interface RomManagerProps {
  romStatuses: RomDisplayInfo[];
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
}

export type { RomManagerProps };
