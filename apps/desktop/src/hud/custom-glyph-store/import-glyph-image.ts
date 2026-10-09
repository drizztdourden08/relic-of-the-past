/* @layer renderer-lib @kind logic */
import type { GlyphPack } from '@rotp/input-mapping';
import { activeProfileId } from '../active-profile';
import type { GlyphPosition } from '@rotp/hud';
import { glyphFiles } from './glyph-files';
import { glyphUrlCache } from './glyph-url-cache';
import { readCustomPacks } from './read-custom-packs';
import { upsertPack } from './upsert-pack';

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
  if (previous?.kind === 'custom') glyphUrlCache.drop(previous.fileKey);

  const fileKey = glyphFiles.fileKeyFor(packId, position, glyphFiles.extensionOf(fileName));
  await glyphFiles.store().writeBytes(glyphFiles.imagePath(profileId, fileKey), bytes);
  glyphUrlCache.drop(fileKey);
  await glyphUrlCache.load(profileId, fileKey);

  return upsertPack({ ...pack, glyphs: { ...pack.glyphs, [position]: { kind: 'custom', fileKey } } });
};

export { importGlyphImage };
