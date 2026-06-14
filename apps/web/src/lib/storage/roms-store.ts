/* @layer renderer-lib @kind logic */
/**
 * Renderer ROMs store, bound to the platform FileStore + FilePicker. Import runs
 * in the renderer (pick/download → jszip/raw → FileStore) and reports progress on
 * the import-progress bus. Mirrors the window.api roms surface where call sites need it.
 */
import type { RomImportResult } from '@shared/storage/roms';
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

const nameFromUrl = (url: string): string => {
  try { return new URL(url).pathname.split('/').pop() || 'rom.sfc'; } catch { return 'rom.sfc'; }
};

const listRomsWithStatus = () => roms.listWithStatus(files());
const getRomInfo = (romFile: string) => roms.getInfo(files(), romFile);
const deleteRom = (romFile: string) => roms.deleteRom(files(), romFile);

const importPicked = async (): Promise<RomImportResult | null> => {
  const picked = await getPlatform().filePicker.pickFile({ extensions: ['sfc', 'smc', 'zip'] });
  if (!picked) return null;
  return finalize(await roms.importBytes(files(), picked.name, picked.bytes, (phase) => emit(phase)));
};

const importFile = async (file: File): Promise<RomImportResult> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return finalize(await roms.importBytes(files(), file.name, bytes, (phase) => emit(phase)));
};

const importUrl = async (url: string): Promise<RomImportResult> => {
  const bytes = await fetchToBytes(url, (loaded, total) => emit('download', loaded, total ?? undefined));
  return finalize(await roms.importBytes(files(), nameFromUrl(url), bytes, (phase) => emit(phase)));
};

export { listRomsWithStatus, getRomInfo, deleteRom, importPicked, importFile, importUrl };
