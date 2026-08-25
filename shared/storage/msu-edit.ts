/* @layer shared-storage @kind logic */
/**
 * Pack editing over FileStore: the `.msul` manifest plus the create/rename/delete
 * operations the pack editor drives. The read-side listing stays in ./msu, which
 * re-exports this file so callers keep a single import site.
 *
 * The three text helpers (parse/serialize/new) are pure so the main-process handlers,
 * which speak Node fs rather than FileStore, share the same format and validation.
 */
import type { FileStore } from '@shared/platform';
import type { MsuPackManifest, MsuPackMeta } from '@shared/types/msu-manifest';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { assertSafeName, packDir, packFile } from './msu-paths';

const manifestPath = (pack: string): string => `${packDir(pack)}/${MSUL_MANIFEST_NAME}`;

const isManifest = (value: unknown): value is MsuPackManifest => {
  const m = value as MsuPackManifest | null;
  return !!m && m.version === 1 && !!m.meta && Array.isArray(m.tracks);
};

/** null for missing text, malformed JSON, or a version this build does not know. */
/**
 * Rewrites a play mode this build no longer has into its current equivalent.
 *
 * There was briefly a separate `repeat` kind for a single self-looping file, before it turned out to
 * be what `loop` with one file already is. A pack saved while it existed must still open, and it must
 * open as the same thing it sounded like, which is now the `single` order.
 */
const migrateMode = (mode: { kind?: unknown }): unknown =>
  (mode?.kind === 'repeat' ? { kind: 'loop', order: 'single' } : mode);

const migrateLayers = (layers: { mode?: { kind?: unknown } }[]): unknown[] =>
  layers.map((layer) => ({ ...layer, mode: migrateMode(layer.mode ?? {}) }));

/** Applied before validation, so a migrated manifest is judged on its current shape. */
const migrateManifest = (parsed: unknown): unknown => {
  if (typeof parsed !== 'object' || parsed === null) return parsed;
  const doc = parsed as { tracks?: unknown; sounds?: Record<string, unknown> };
  const tracks = Array.isArray(doc.tracks)
    ? doc.tracks.map((t) => (typeof t === 'object' && t !== null && Array.isArray((t as { layers?: unknown }).layers)
      ? { ...t, layers: migrateLayers((t as { layers: { mode?: { kind?: unknown } }[] }).layers) }
      : t))
    : doc.tracks;
  const sounds = doc.sounds === undefined ? undefined : Object.fromEntries(
    Object.entries(doc.sounds).map(([channel, defs]) => [channel, Array.isArray(defs)
      ? defs.map((d) => (typeof d === 'object' && d !== null && Array.isArray((d as { layers?: unknown }).layers)
        ? { ...d, layers: migrateLayers((d as { layers: { mode?: { kind?: unknown } }[] }).layers) }
        : d))
      : defs]),
  );
  return sounds === undefined ? { ...doc, tracks } : { ...doc, tracks, sounds };
};

const parseManifest = (text: string | null): MsuPackManifest | null => {
  if (text == null) return null;
  try {
    const parsed: unknown = migrateManifest(JSON.parse(text));
    return isManifest(parsed) ? parsed : null;
  } catch { return null; }
};

/** The on-disk form: modifiedAt stamped, 2-space indent, trailing newline. */
const serializeManifest = (manifest: MsuPackManifest): string => {
  const stamped: MsuPackManifest = { ...manifest, meta: { ...manifest.meta, modifiedAt: Date.now() } };
  return `${JSON.stringify(stamped, null, 2)}\n`;
};

/** A fresh v1 manifest for an empty pack — the pack name doubles as the default title. */
const newManifest = (pack: string, meta?: Partial<MsuPackMeta>): MsuPackManifest => {
  const now = Date.now();
  return { version: 1, meta: { name: pack, ...meta, createdAt: now, modifiedAt: now }, tracks: [] };
};

/** null for a classic pack (no manifest), and for one that is unreadable or an unknown version. */
const readManifest = async (files: FileStore, pack: string): Promise<MsuPackManifest | null> =>
  parseManifest(await files.readText(manifestPath(pack)));

const writeManifest = (files: FileStore, pack: string, manifest: MsuPackManifest): Promise<void> => {
  assertSafeName(pack);
  return files.writeText(manifestPath(pack), serializeManifest(manifest));
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
