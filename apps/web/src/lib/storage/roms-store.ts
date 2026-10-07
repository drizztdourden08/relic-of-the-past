/* @layer renderer-lib @kind logic */
/**
 * Renderer ROMs store, bound to the platform FileStore + FilePicker. Import runs
 * in the renderer (pick/download → jszip/raw → FileStore) and reports progress on
 * the import-progress bus.
 *
 * Every import names its kind. The base cartridge boots the game; a supplement only adds
 * to one, is digest-checked before it is written, and never replaces a file already there.
 */
import type { RomImportResult } from '@shared/storage/roms';
import type { RomKind } from '@shared/storage/rom-kinds';
import * as roms from '@shared/storage/roms';
import { fetchToBytes } from '@shared/storage/download';
import { getPlatform } from '@app/platform/get-platform';
import { publishImportProgress } from './import-progress-bus';

const files = () => getPlatform().files;

type Phase = 'download' | 'extract' | 'copy' | 'done' | 'error';
const emit = (phase: Phase, loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'rom', id: 'rom', phase, loaded, total, message });

const finalize = (result: RomImportResult): RomImportResult => {
  if (result.success) emit('done');
  else emit('error', undefined, undefined, result.error);
  return result;
};

const fallbackName = (kind: RomKind): string => (kind === 'gba-alttp' ? 'rom.gba' : 'rom.sfc');

const nameFromUrl = (url: string, kind: RomKind): string => {
  try { return new URL(url).pathname.split('/').pop() || fallbackName(kind); } catch { return fallbackName(kind); }
};

const listRomsWithStatus = () => roms.listWithStatus(files());
const listSupplements = () => roms.listSupplements(files());
const getRomInfo = (romFile: string) => roms.getInfo(files(), romFile);
const deleteRom = (romFile: string) => roms.deleteRom(files(), romFile);

const importPicked = async (kind: RomKind = 'snes-alttp'): Promise<RomImportResult | null> => {
  const picked = await getPlatform().filePicker.pickFile({ extensions: [...roms.pickExtensionsFor(kind)] });
  if (!picked) return null;
  return finalize(await roms.importBytes(files(), picked.name, picked.bytes, kind, (phase) => emit(phase)));
};

const importFile = async (file: File, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return finalize(await roms.importBytes(files(), file.name, bytes, kind, (phase) => emit(phase)));
};

const importUrl = async (url: string, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> => {
  const bytes = await fetchToBytes(url, (loaded, total) => emit('download', loaded, total ?? undefined));
  return finalize(await roms.importBytes(files(), nameFromUrl(url, kind), bytes, kind, (phase) => emit(phase)));
};

export { deleteRom, getRomInfo, importFile, importPicked, importUrl, listRomsWithStatus, listSupplements };
