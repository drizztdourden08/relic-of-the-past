/* @layer renderer-components @kind types */
import type { SupplementStatus } from '@shared/storage/roms';
import type { RomDetail } from './rom-detail.type';

interface RomDetailPanelProps {
  selected: string | null;
  loadingDetail: boolean;
  detail: RomDetail | null;
  selectedBase: RomDisplayInfo | undefined;
  selectedSupplement: SupplementStatus | undefined;
  onExtractAssets: (romFile: string) => void;
}

interface AssetsRowProps {
  base: RomDisplayInfo;
  onExtractAssets: (romFile: string) => void;
}

interface SupplementRowProps {
  supplement: SupplementStatus;
}

export type { RomDetailPanelProps, AssetsRowProps, SupplementRowProps };
