/* @layer renderer-components @kind constants */
import type { RomKind } from '@rotp/roms';

const ROM_PLATFORM_LABELS: Record<RomKind, string> = {
  'snes-alttp': 'SNES',
  'gba-alttp': 'GBA',
};

export { ROM_PLATFORM_LABELS };
