/* @layer renderer-lib @kind logic */
import type { GlyphPack, GlyphSource } from '@rotp/input-mapping';
import { activeProfileId } from '../active-profile';
import { glyphUrlCache } from './glyph-url-cache';

const primeGlyphUrls = async (packs: readonly GlyphPack[]): Promise<void> => {
  const profileId = await activeProfileId();
  if (!profileId) return;
  const keys = packs.flatMap((pack) => Object.values(pack.glyphs)
    .filter((source): source is GlyphSource => !!source && source.kind === 'custom')
    .map((source) => (source.kind === 'custom' ? source.fileKey : '')));
  await Promise.all(keys.filter(Boolean).map((key) => glyphUrlCache.load(profileId, key)));
};

export { primeGlyphUrls };
