/* @layer renderer-components @kind types */
import type { SupplementStatus } from '@rotp/roms';
import type { RomDetail } from './rom-detail.type';

interface RomDetailPanelProps {
  selected: string | null;
  loadingDetail: boolean;
  detail: RomDetail | null;
  selectedBase: RomDisplayInfo | undefined;
  selectedSupplement: SupplementStatus | undefined;
  onExtractAssets: (romFile: string) => Promise<boolean>;
}

interface AssetsRowProps {
  base: RomDisplayInfo;
  onExtractAssets: (romFile: string) => Promise<boolean>;
}

interface SupplementRowProps {
  supplement: SupplementStatus;
}

export type { RomDetailPanelProps, AssetsRowProps, SupplementRowProps };
