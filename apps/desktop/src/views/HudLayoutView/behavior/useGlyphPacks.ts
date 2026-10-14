/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { BUILT_IN_GLYPH_PACKS } from '@rotp/input-mapping';
import { allGlyphPacks, primeGlyphUrls } from '@app/hud/custom-glyph-store';
import { log } from '@app/log-bus';
import type { GlyphPack } from '@rotp/input-mapping';

const useGlyphPacks = (): readonly GlyphPack[] => {
  const [packs, setPacks] = useState<readonly GlyphPack[]>(BUILT_IN_GLYPH_PACKS);

  useEffect(() => {
    const cancel = new AbortController();
    void (async () => {
      try {
        const loaded = await allGlyphPacks();
        await primeGlyphUrls(loaded);
        if (!cancel.signal.aborted) setPacks(loaded);
      } catch (e: unknown) {
        log.error(`[hud] failed to load custom glyph packs: ${e instanceof Error ? e.message : String(e)}`);
      }
    })();
    return () => cancel.abort();
  }, []);

  return packs;
};

export { useGlyphPacks };
