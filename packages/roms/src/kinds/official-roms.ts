/* @layer shared-storage @kind logic */
import { ZELDA3_SHA1 } from '@rotp/asset-extraction';
import { OFFICIAL_ROMS } from './official-roms.constants';
import { ROM_KINDS } from './rom-kind-specs.constants';
import type { OfficialRom, OfficialRomStatus } from './official-roms.type';

const isSupported = (rom: OfficialRom): boolean =>
  rom.kind === 'snes-alttp' ? rom.sha1 in ZELDA3_SHA1 : ROM_KINDS[rom.kind].sha1.includes(rom.sha1);

const officialRomStatuses = (): readonly OfficialRomStatus[] =>
  OFFICIAL_ROMS.map((rom) => ({ ...rom, supported: isSupported(rom) }));

export { officialRomStatuses };
