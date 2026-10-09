/* @layer shared-storage @kind data */
import type { RomKind, RomKindSpec } from './rom-kinds.type';

const ALTTP_GBA_US_SHA256 = 'f328f8f07d736288a00c80d31cc1630f3aa02aaf20efdcba73d31dae832b5d76';

const ROM_KINDS: Record<RomKind, RomKindSpec> = {
  'snes-alttp': {
    kind: 'snes-alttp',
    label: 'Base cartridge',
    pattern: /\.(sfc|smc)$/i,
    pickExtensions: ['sfc', 'smc', 'zip'],
    maxBytes: 8 * 1024 * 1024,
    accepts: [],
    role: 'base',
  },
  'gba-alttp': {
    kind: 'gba-alttp',
    label: 'Second cartridge',
    pattern: /\.gba$/i,
    pickExtensions: ['gba', 'zip'],
    maxBytes: 32 * 1024 * 1024,
    accepts: [ALTTP_GBA_US_SHA256],
    role: 'supplement',
    sourceId: 'gba-alttp',
  },
};

export { ALTTP_GBA_US_SHA256, ROM_KINDS };
