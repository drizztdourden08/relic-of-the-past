/* @layer renderer-lib @kind logic */
import type { GlyphPack } from '@rotp/input-mapping';
import { activeProfileId } from '../active-profile';
import type { GlyphPosition } from '@rotp/hud';
import { glyphFiles } from './glyph-files';
import { glyphUrlCache } from './glyph-url-cache';
import { readCustomPacks } from './read-custom-packs';
import { upsertPack } from './upsert-pack';

const removeGlyphImage = async (packId: string, position: GlyphPosition): Promise<GlyphPack | null> => {
  const profileId = await activeProfileId();
  if (!profileId) return null;
  const pack = (await readCustomPacks()).find((p) => p.id === packId);
  if (!pack) return null;
  const source = pack.glyphs[position];
  if (source?.kind === 'custom') {
    glyphUrlCache.drop(source.fileKey);
    await glyphFiles.store().remove(glyphFiles.imagePath(profileId, source.fileKey));
  }
  const { [position]: _dropped, ...glyphs } = pack.glyphs;
  return upsertPack({ ...pack, glyphs });
};

export { removeGlyphImage };
