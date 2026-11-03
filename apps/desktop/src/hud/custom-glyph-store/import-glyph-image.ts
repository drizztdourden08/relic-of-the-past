/* @layer renderer-lib @kind logic */
import type { GlyphPack } from '@rotp/input-mapping';
import type { GlyphPosition } from '@rotp/hud';
import { glyphFiles } from './glyph-files';
import { glyphUrlCache } from './glyph-url-cache';
import { upsertPack } from './upsert-pack';
import { withCustomPack } from './with-custom-pack';

const importGlyphImage = (
  packId: string,
  position: GlyphPosition,
  fileName: string,
  bytes: Uint8Array,
): Promise<GlyphPack | null> =>
  withCustomPack(packId, async ({ profileId, pack }) => {
    const previous = pack.glyphs[position];
    if (previous?.kind === 'custom') glyphUrlCache.drop(previous.fileKey);

    const fileKey = glyphFiles.fileKeyFor(packId, position, glyphFiles.extensionOf(fileName));
    await glyphFiles.store().writeBytes(glyphFiles.imagePath(profileId, fileKey), bytes);
    glyphUrlCache.drop(fileKey);
    await glyphUrlCache.load(profileId, fileKey);

    return upsertPack({ ...pack, glyphs: { ...pack.glyphs, [position]: { kind: 'custom', fileKey } } });
  });

export { importGlyphImage };
