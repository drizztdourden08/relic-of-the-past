/* @layer shared-storage @kind types */
import type { RomKind } from './rom-kinds.type';

interface OfficialRom {
  name: string;
  kind: RomKind;
  sha1: string;
}

interface OfficialRomStatus extends OfficialRom {
  supported: boolean;
}

export type { OfficialRom, OfficialRomStatus };
