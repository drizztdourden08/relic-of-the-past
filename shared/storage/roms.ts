/* @layer shared-storage @kind logic */
/**
 * ROMs store over FileStore: list/status/info/delete + byte-based import (ZIP via
 * jszip or raw), mirroring the Electron layout (roms/<file>, assets/<stem>.dat).
 * Deleting a ROM cascades to profiles that use it (via the profile store).
 */
import type { FileStore } from '@shared/platform';
import { sha256Hex } from './hash';
import { isZip, unzip } from './archive';
import { listProfiles, deleteProfile } from './profiles';

type RomImportResult = { success: boolean; romFile: string; error?: string; alreadyExists?: boolean };
type ImportPhase = (phase: 'extract' | 'copy', loaded?: number, total?: number) => void;

const ROM_RE = /\.(sfc|smc)$/i;
const RAW_ROM_MAX_BYTES = 8 * 1024 * 1024;
const datName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '.dat');

const listRoms = async (files: FileStore): Promise<string[]> =>
  (await files.list('roms')).filter((f) => ROM_RE.test(f));

const listWithStatus = async (files: FileStore): Promise<{ romFile: string; hasAssets: boolean; assetSize: number | null }[]> => {
  const out: { romFile: string; hasAssets: boolean; assetSize: number | null }[] = [];
  for (const romFile of await listRoms(files)) {
    const stat = await files.stat(`assets/${datName(romFile)}`);
    const hasAssets = !!stat && stat.bytes > 0;
    out.push({ romFile, hasAssets, assetSize: hasAssets ? stat!.bytes : null });
  }
  return out;
};

const getInfo = async (files: FileStore, romFile: string): Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null> => {
  const stat = await files.stat(`roms/${romFile}`);
  const bytes = await files.readBytes(`roms/${romFile}`);
  if (!stat || !bytes) return null;
  const hash = (await sha256Hex(bytes)).slice(0, 16);
  const iso = new Date(stat.mtimeMs).toISOString();
  return { name: romFile, size: stat.bytes, hash, created: iso, modified: iso };
};

const deleteRom = async (files: FileStore, romFile: string): Promise<void> => {
  await files.remove(`roms/${romFile}`);
  await files.remove(`assets/${datName(romFile)}`);
  for (const profile of await listProfiles(files)) {
    if (profile.romFile === romFile) await deleteProfile(files, profile.id);
  }
};

// Import raw bytes (a chosen file or a download): ZIP → single ROM entry, else raw.
const importBytes = async (files: FileStore, fileName: string, bytes: Uint8Array, onPhase?: ImportPhase): Promise<RomImportResult> => {
  let romName = fileName;
  let romBytes = bytes;
  if (isZip(bytes)) {
    onPhase?.('extract');
    const roms = (await unzip(bytes)).filter((e) => ROM_RE.test(e.name));
    if (roms.length === 0) return { success: false, error: 'No ROM (.sfc/.smc) found in the archive', romFile: '' };
    if (roms.length > 1) return { success: false, error: `Multiple ROM files found (${roms.length}). Provide exactly one ROM.`, romFile: '' };
    romName = roms[0].name;
    romBytes = roms[0].bytes;
  } else if (!ROM_RE.test(fileName)) {
    if (bytes.length === 0 || bytes.length > RAW_ROM_MAX_BYTES) return { success: false, error: 'File is not a valid ROM or archive', romFile: '' };
    romName = `rom-${Date.now()}.sfc`;
  }
  const dest = `roms/${romName}`;
  if (await files.exists(dest)) return { success: true, romFile: romName, alreadyExists: true };
  onPhase?.('copy');
  await files.writeBytes(dest, romBytes);
  return { success: true, romFile: romName, alreadyExists: false };
};

export { listRoms, listWithStatus, getInfo, deleteRom, importBytes };
export type { RomImportResult };
