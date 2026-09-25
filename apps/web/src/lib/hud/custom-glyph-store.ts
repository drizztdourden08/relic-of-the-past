/* @layer renderer-lib @kind logic */
/**
 * The player's own controller glyphs.
 *
 * A custom pack is an OVERRIDE, never a replacement: it holds only the
 * positions the player actually imported and names a built-in as its
 * `fallbackPack`, so a pack containing four face buttons still draws correct
 * shoulders, triggers and d-pad through the chain in `resolve-glyph.ts`. That
 * is what makes importing one button a one-minute job instead of a twenty-glyph
 * commitment.
 *
 * Images are stored exactly the way user sprites are, as raw bytes in the
 * platform FileStore under the profile's own folder with a JSON manifest
 * beside them. They are handed to the renderer as object URLs. A stored file
 * has no URL of its own on either host (there is no protocol handler for this
 * folder the way there is for extracted sprites), so the bytes are read once
 * and cached; `customGlyphUrl` is the synchronous lookup a render pass needs.
 */
import { getPlatform } from '@app/platform/get-platform';
import { readJson, writeJson } from '@shared/storage/json';
import { newId } from '@shared/storage/id';
import { BUILT_IN_GLYPH_PACKS, GENERIC_PACK_ID } from '@shared/input/glyphs';
import { activeProfileId } from './active-profile';
import type { GlyphPack, GlyphSource } from '@shared/types/hud';
import type { SdlAxisName, SdlButtonName } from '@shared/input/sdl-buttons';

type GlyphPosition = SdlButtonName | SdlAxisName;

const files = () => getPlatform().files;

const packsPath = (profileId: string): string => `profiles/${profileId}/hud-glyph-packs.json`;
const imagePath = (profileId: string, fileKey: string): string => `profiles/${profileId}/hud-glyphs/${fileKey}`;

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
};

const extensionOf = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ? ext : 'png';
};

/** One file per pack and position, flat: the file name is the key, so nothing
 *  has to walk a directory tree to find a glyph again. */
const fileKeyFor = (packId: string, position: GlyphPosition, ext: string): string =>
  `${packId}__${position}.${ext}`;

const urlCache = new Map<string, string>();

const customGlyphUrl = (fileKey: string): string | null => urlCache.get(fileKey) ?? null;

const cacheGlyph = async (profileId: string, fileKey: string): Promise<string | null> => {
  const cached = urlCache.get(fileKey);
  if (cached) return cached;
  const bytes = await files().readBytes(imagePath(profileId, fileKey));
  if (!bytes) return null;
  const type = MIME_BY_EXT[extensionOf(fileKey)] ?? 'image/png';
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
  urlCache.set(fileKey, url);
  return url;
};

const dropCached = (fileKey: string): void => {
  const url = urlCache.get(fileKey);
  if (!url) return;
  URL.revokeObjectURL(url);
  urlCache.delete(fileKey);
};

const readCustomPacks = async (): Promise<GlyphPack[]> => {
  const profileId = await activeProfileId();
  if (!profileId) return [];
  const stored = await readJson<GlyphPack[]>(files(), packsPath(profileId), []);
  return Array.isArray(stored) ? stored.filter((p) => !!p && typeof p.id === 'string') : [];
};

const writeCustomPacks = async (packs: readonly GlyphPack[]): Promise<void> => {
  const profileId = await activeProfileId();
  if (!profileId) return;
  await writeJson(files(), packsPath(profileId), packs);
};

/** Load every image a set of packs names, so a render pass can look them up
 *  synchronously. Safe to call again: an already-cached key is not re-read. */
const primeGlyphUrls = async (packs: readonly GlyphPack[]): Promise<void> => {
  const profileId = await activeProfileId();
  if (!profileId) return;
  const keys = packs.flatMap((pack) => Object.values(pack.glyphs)
    .filter((source): source is GlyphSource => !!source && source.kind === 'custom')
    .map((source) => (source.kind === 'custom' ? source.fileKey : '')));
  await Promise.all(keys.filter(Boolean).map((key) => cacheGlyph(profileId, key)));
};

const upsertPack = async (pack: GlyphPack): Promise<GlyphPack> => {
  const existing = await readCustomPacks();
  const index = existing.findIndex((p) => p.id === pack.id);
  const next = index >= 0 ? existing.map((p, i) => (i === index ? pack : p)) : [...existing, pack];
  await writeCustomPacks(next);
  return pack;
};

const createCustomPack = async (name: string, fallbackPack = GENERIC_PACK_ID): Promise<GlyphPack> =>
  upsertPack({
    id: `glyphs-${newId()}`,
    name: name.trim() || 'My glyphs',
    builtIn: false,
    glyphs: {},
    fallbackPack,
  });

/**
 * Put one image on one position of one custom pack. The bytes land under the
 * profile, the pack's manifest gains a `{ kind: 'custom' }` source, and the new
 * object URL is cached before the caller re-renders.
 */
const importGlyphImage = async (
  packId: string,
  position: GlyphPosition,
  fileName: string,
  bytes: Uint8Array,
): Promise<GlyphPack | null> => {
  const profileId = await activeProfileId();
  if (!profileId) return null;
  const packs = await readCustomPacks();
  const pack = packs.find((p) => p.id === packId);
  if (!pack) return null;

  const previous = pack.glyphs[position];
  if (previous?.kind === 'custom') dropCached(previous.fileKey);

  const fileKey = fileKeyFor(packId, position, extensionOf(fileName));
  await files().writeBytes(imagePath(profileId, fileKey), bytes);
  dropCached(fileKey);
  await cacheGlyph(profileId, fileKey);

  return upsertPack({ ...pack, glyphs: { ...pack.glyphs, [position]: { kind: 'custom', fileKey } } });
};

const removeGlyphImage = async (packId: string, position: GlyphPosition): Promise<GlyphPack | null> => {
  const profileId = await activeProfileId();
  if (!profileId) return null;
  const pack = (await readCustomPacks()).find((p) => p.id === packId);
  if (!pack) return null;
  const source = pack.glyphs[position];
  if (source?.kind === 'custom') {
    dropCached(source.fileKey);
    await files().remove(imagePath(profileId, source.fileKey));
  }
  const { [position]: _dropped, ...glyphs } = pack.glyphs;
  return upsertPack({ ...pack, glyphs });
};

const deleteCustomPack = async (packId: string): Promise<void> => {
  const profileId = await activeProfileId();
  const packs = await readCustomPacks();
  const pack = packs.find((p) => p.id === packId);
  if (pack && profileId) {
    for (const source of Object.values(pack.glyphs)) {
      if (source?.kind !== 'custom') continue;
      dropCached(source.fileKey);
      await files().remove(imagePath(profileId, source.fileKey));
    }
  }
  await writeCustomPacks(packs.filter((p) => p.id !== packId));
};

/** Every pack a picker or the glyph chain should see, shipped ones first. */
const allGlyphPacks = async (): Promise<GlyphPack[]> => [...BUILT_IN_GLYPH_PACKS, ...(await readCustomPacks())];

export {
  allGlyphPacks,
  createCustomPack,
  customGlyphUrl,
  deleteCustomPack,
  importGlyphImage,
  primeGlyphUrls,
  readCustomPacks,
  removeGlyphImage,
};
export type { GlyphPosition };
