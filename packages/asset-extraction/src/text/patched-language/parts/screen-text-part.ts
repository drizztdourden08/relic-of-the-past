/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../../rom/rom-types';
import type { DecodedLine } from '../../menu-text/menu-text.type';
import type { PatchedPartId, PatchedPartReport, PatchedWork } from '../patched-language.type';
import { changedLines } from './changed-lines';

interface ScreenTextRead {
  part: Extract<PatchedPartId, 'menu-text' | 'credits'>;
  decode: (rom: RomData, base: string) => DecodedLine[];
  keep: (work: PatchedWork, lines: Record<string, string>) => void;
}

const baseLines = (read: ScreenTextRead, work: PatchedWork): DecodedLine[] | null => {
  if (!work.baseRom) return null;
  try {
    return read.decode(work.baseRom, work.base);
  } catch {
    return null;
  }
};

const screenTextPart = (read: ScreenTextRead, work: PatchedWork): PatchedPartReport => {
  const lines = read.decode(work.patched, work.base);
  const before = baseLines(read, work);
  const changed = changedLines(lines, before);
  read.keep(work, changed);
  const count = Object.keys(changed).length;
  if (before === null) return { part: read.part, status: 'ok', detail: `${count} lines read.` };
  return { part: read.part, status: 'ok', detail: `${count} of ${lines.length} lines differ from the release.` };
};

export { screenTextPart };
export type { ScreenTextRead };
