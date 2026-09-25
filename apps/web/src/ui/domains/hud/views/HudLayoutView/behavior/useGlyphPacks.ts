/* @layer renderer-hud @kind hook */
/**
 * Every glyph pack the resolver should see, meaning the shipped ones plus the
 * profile's own, with their images already primed.
 *
 * Two things have to be true before a custom glyph can be drawn: the pack has to
 * be in the list `resolveGlyph` walks, and its file has to have an object URL
 * `HudGlyph` can look up synchronously. Both are async to obtain and neither is
 * useful without the other, so they are done together and published in one go:
 * priming BEFORE the state update means the first render that sees a custom pack
 * is also the first render that can draw it, instead of flashing a hole.
 *
 * The shipped packs are the initial value instead of an empty list, so the
 * cluster draws correctly on the very first frame and gains the player's own
 * artwork when it arrives.
 */
import { useEffect, useState } from 'react';
import { BUILT_IN_GLYPH_PACKS } from '@shared/input/glyphs';
import { allGlyphPacks, primeGlyphUrls } from '@app/lib/hud/custom-glyph-store';
import type { GlyphPack } from '@shared/types/hud';

const useGlyphPacks = (): readonly GlyphPack[] => {
  const [packs, setPacks] = useState<readonly GlyphPack[]>(BUILT_IN_GLYPH_PACKS);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const loaded = await allGlyphPacks();
        await primeGlyphUrls(loaded);
        if (live) setPacks(loaded);
      } catch (e: unknown) {
        console.error('[hud] failed to load custom glyph packs', e);
      }
    })();
    return () => { live = false; };
  }, []);

  return packs;
};

export { useGlyphPacks };
