/* @layer renderer-lib @kind logic */
import type { RomImportResult } from '@shared/storage/roms';
import type { RomKind } from '@shared/storage/rom-kinds';
import * as roms from '@shared/storage/roms';
import { fetchToBytes } from '@shared/storage/download';
import { platformFiles } from '../platform-files';
import { emitRomProgress } from './emit-rom-progress';
import { finalizeRomImport } from './finalize-rom-import';

const fallbackName = (kind: RomKind): string => (kind === 'gba-alttp' ? 'rom.gba' : 'rom.sfc');

const nameFromUrl = (url: string, kind: RomKind): string => {
  try { return new URL(url).pathname.split('/').pop() || fallbackName(kind); } catch { return fallbackName(kind); }
};

const importUrl = async (url: string, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> => {
  const bytes = await fetchToBytes(url, (loaded, total) => emitRomProgress('download', loaded, total ?? undefined));
  return finalizeRomImport(await roms.importBytes(platformFiles(), nameFromUrl(url, kind), bytes, kind, (phase) => emitRomProgress(phase)));
};

export { importUrl };
