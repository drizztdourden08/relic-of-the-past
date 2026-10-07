/* @layer shared-storage @kind logic */
/**
 * Pack editing over FileStore: the `.msul` manifest plus create/rename/delete. The read-side
 * listing stays in ./msu, which re-exports this file. The three text helpers (parse/serialize/new)
 * are pure so the main-process handlers, which speak Node fs, share the same format and validation.
 */
import type { FileStore } from '@shared/platform';
import type { MsuPackManifest, MsuPackMeta } from '@shared/types/msu-manifest';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { listPackEntries } from './msu-inventory';
import { assertSafeName, packDir, packFile } from './msu-paths';

const manifestPath = (pack: string): string => `${packDir(pack)}/${MSUL_MANIFEST_NAME}`;

const isManifest = (value: unknown): value is MsuPackManifest => {
  const m = value as MsuPackManifest | null;
  return !!m && m.version === 1 && !!m.meta && Array.isArray(m.tracks);
};

/** null for missing text, malformed JSON, or a version this build does not know. */
const parseManifest = (text: string | null): MsuPackManifest | null => {
  if (text == null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return isManifest(parsed) ? parsed : null;
  } catch { return null; }
};

/** The on-disk form: modifiedAt stamped, 2-space indent, trailing newline. */
const serializeManifest = (manifest: MsuPackManifest): string => {
  const stamped: MsuPackManifest = { ...manifest, meta: { ...manifest.meta, modifiedAt: Date.now() } };
  return `${JSON.stringify(stamped, null, 2)}\n`;
};

/** A fresh v1 manifest for an empty pack, using the pack name as the default title. */
const newManifest = (pack: string, meta?: Partial<MsuPackMeta>): MsuPackManifest => {
  const now = Date.now();
  return { version: 1, meta: { name: pack, ...meta, createdAt: now, modifiedAt: now }, tracks: [] };
};

/**
 * A pack's name is its folder. The name inside its settings follows the folder on every read and
 * every write, so a renamed pack, its export and its store install all carry the same name.
 */
const withPackName = (manifest: MsuPackManifest, pack: string): MsuPackManifest =>
  ({ ...manifest, meta: { ...manifest.meta, name: pack } });

/** null for a classic pack (no manifest), and for one that is unreadable or an unknown version. */
const readManifest = async (files: FileStore, pack: string): Promise<MsuPackManifest | null> => {
  const manifest = parseManifest(await files.readText(manifestPath(pack)));
  return manifest && withPackName(manifest, pack);
};

/**
 * The inventory is taken from the folder at write time, never from the caller: a manifest from
 * memory only knows the files it was read with, and the folder has moved on since. That keeps
 * the list a record of the pack, not a claim about it.
 */
const writeManifest = async (files: FileStore, pack: string, manifest: MsuPackManifest): Promise<void> => {
  assertSafeName(pack);
  const inventory = await listPackEntries(files, pack);
  await files.writeText(manifestPath(pack), serializeManifest({ ...withPackName(manifest, pack), files: inventory }));
};

const createPack = async (files: FileStore, pack: string, meta?: Partial<MsuPackMeta>): Promise<void> => {
  assertSafeName(pack);
  if (await files.exists(packDir(pack))) throw new Error(`MSU pack already exists: ${pack}`);
  await writeManifest(files, pack, newManifest(pack, meta));
};

// FileStore has no move, so a rename copies every entry across and drops the old dir.
const renamePack = async (files: FileStore, from: string, to: string): Promise<void> => {
  assertSafeName(from);
  assertSafeName(to);
  if (from === to) return;
  if (await files.exists(packDir(to))) throw new Error(`MSU pack already exists: ${to}`);
  for (const name of await files.list(packDir(from))) {
    const bytes = await files.readBytes(`${packDir(from)}/${name}`);
    if (bytes) await files.writeBytes(`${packDir(to)}/${name}`, bytes);
  }
  // Rewritten so the name inside its settings becomes the new folder name.
  const manifest = await readManifest(files, to);
  if (manifest) await writeManifest(files, to, manifest);
  await files.remove(packDir(from));
};

const writeTrackFile = (files: FileStore, pack: string, fileName: string, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(packFile(pack, fileName), bytes);

const deleteTrackFile = (files: FileStore, pack: string, fileName: string): Promise<void> =>
  files.remove(packFile(pack, fileName));

const renameTrackFile = async (files: FileStore, pack: string, fromFileName: string,
  toFileName: string): Promise<void> => {
  const src = packFile(pack, fromFileName);
  const dest = packFile(pack, toFileName);
  if (src === dest) return;
  const bytes = await files.readBytes(src);
  if (!bytes) throw new Error(`Track not found: ${fromFileName}`);
  await files.writeBytes(dest, bytes);
  await files.remove(src);
};

export {
  manifestPath, parseManifest, serializeManifest, newManifest,
  readManifest, writeManifest, createPack, renamePack, writeTrackFile, deleteTrackFile, renameTrackFile,
};
