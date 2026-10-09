/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { BUILT_IN_GLYPH_PACKS } from '@rotp/input-mapping';
import { allGlyphPacks, primeGlyphUrls } from '@app/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';

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
