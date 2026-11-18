/* @layer renderer-components @kind types */
import type { OfficialRomStatus } from '@rotp/roms';

interface RomTableProps {
  roms: readonly OfficialRomStatus[];
}

export type { RomTableProps };
