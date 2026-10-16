/* @layer renderer-components @kind types */
interface RomManagerProps {
  romStatuses: RomDisplayInfo[];
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => Promise<boolean>;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
}

export type { RomManagerProps };
