/* @layer renderer-lib @kind logic */
import type { GlyphPack } from '@rotp/input-mapping';
import type { GlyphPosition } from '@rotp/hud';
import { glyphFiles } from './glyph-files';
import { glyphUrlCache } from './glyph-url-cache';
import { upsertPack } from './upsert-pack';
import { withCustomPack } from './with-custom-pack';

const removeGlyphImage = (packId: string, position: GlyphPosition): Promise<GlyphPack | null> =>
  withCustomPack(packId, async ({ profileId, pack }) => {
    const source = pack.glyphs[position];
    if (source?.kind === 'custom') {
      glyphUrlCache.drop(source.fileKey);
      await glyphFiles.store().remove(glyphFiles.imagePath(profileId, source.fileKey));
    }
    const { [position]: _dropped, ...glyphs } = pack.glyphs;
    return upsertPack({ ...pack, glyphs });
  });

export { removeGlyphImage };
