/* @layer shared-asset-extraction @kind types */
import type { RomData } from '../../../rom/rom-types';
import type { DecodedLine } from '../../menu-text/menu-text.type';
import type { PatchedPartId, PatchedWork } from '../patched-language.type';

interface ScreenTextRead {
  part: Extract<PatchedPartId, 'menu-text' | 'credits'>;
  decode: (rom: RomData, base: string) => DecodedLine[];
  keep: (work: PatchedWork, lines: Record<string, string>) => void;
}

export type { ScreenTextRead };
