/* @layer renderer-hud @kind hook */
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
