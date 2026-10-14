/* @layer shared-storage @kind data */
import type { RomKind, RomKindSpec } from './rom-kinds.type';

const ALTTP_GBA_US_SHA1 = 'A272055ABBBF6C26B0CD54C87395D01699589161';

const ROM_KINDS: Record<RomKind, RomKindSpec> = {
  'snes-alttp': {
    kind: 'snes-alttp',
    label: 'Base cartridge',
    pattern: /\.(sfc|smc)$/i,
    pickExtensions: ['sfc', 'smc', 'zip'],
    maxBytes: 8 * 1024 * 1024,
    sha1: [],
    acceptUnknown: true,
    role: 'base',
  },
  'gba-alttp': {
    kind: 'gba-alttp',
    label: 'Second cartridge',
    pattern: /\.gba$/i,
    pickExtensions: ['gba', 'zip'],
    maxBytes: 32 * 1024 * 1024,
    sha1: [ALTTP_GBA_US_SHA1],
    acceptUnknown: false,
    role: 'supplement',
    sourceId: 'gba-alttp',
  },
};

export { ROM_KINDS };
