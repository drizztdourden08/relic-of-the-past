/* @layer renderer-components @kind types */
import type { SupplementStatus } from '@rotp/roms';

interface RomListProps {
  romStatuses: RomDisplayInfo[];
  supplements: SupplementStatus[];
  selected: string | null;
  onSelect: (romFile: string) => void;
  onDelete: (romFile: string) => void;
}

export type { RomListProps };
