/* @layer electron-main @kind logic */
/**
 * Where one pack's files are on disk, and its manifest read and written, over Node fs.
 *
 * Pack and file names reach the main process from the renderer, so EVERY name that becomes a
 * path segment is checked for traversal before it is joined — that check is the reason these
 * helpers exist as one module rather than being spelled out per handler.
 *
 * The manifest format itself is not defined here: parse/serialize come from
 * shared/storage/msu-edit, so the Node-fs handlers and the FileStore-backed renderer can
 * never drift on what a `pack.json` is.
 */
import { dirname, join } from 'path';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { isSafeName } from '@shared/storage/msu-paths';
import { parseManifest, serializeManifest } from '@shared/storage/msu-edit';
import { getUserDataPath } from '../lib/paths';

const safeName = (name: string): string => {
  if (!isSafeName(name)) throw new Error('Invalid filename');
  return name;
};

const packPath = (pack: string): string => getUserDataPath('msu', safeName(pack));

const packFilePath = (pack: string, fileName: string): string =>
  join(packPath(pack), safeName(fileName));

const manifestPath = (pack: string): string => join(packPath(pack), MSUL_MANIFEST_NAME);

const pathExists = async (path: string): Promise<boolean> => {
  try { await stat(path); return true; } catch { return false; }
};

const readPackText = async (path: string): Promise<string | null> => {
  try { return await readFile(path, 'utf-8'); } catch { return null; }
};

/** null for a classic pack (no manifest), and for one that is unreadable or an unknown version. */
const readPackManifest = async (pack: string): Promise<MsuPackManifest | null> =>
  parseManifest(await readPackText(manifestPath(pack)));

const writePackManifest = async (pack: string, manifest: MsuPackManifest): Promise<void> => {
  const path = manifestPath(pack);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, serializeManifest(manifest), 'utf-8');
};

export {
  manifestPath, packFilePath, packPath, pathExists, readPackManifest, readPackText, safeName,
  writePackManifest,
};
