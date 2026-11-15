/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { GlyphMap } from '@rotp/asset-extraction';
import { loadSetFont } from './load-set-font';
import type { SetFontAssets } from './load-set-font';
import type { SetFontState } from './set-font.type';

const useSetFont = (setId: string | null, base?: string, glyphs?: GlyphMap): SetFontState => {
  const [assets, setAssets] = useState<SetFontAssets | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(setId));

  useEffect(() => {
    if (!setId) {
      setAssets(null);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    void loadSetFont(setId, base, glyphs).then((next) => {
      if (!live) return;
      setAssets(next);
      setLoading(false);
    });
    return () => { live = false; };
  }, [setId, base, glyphs]);

  return useMemo(
    () => ({ sheet: assets?.sheet ?? null, metrics: assets?.metrics ?? null, loading }),
    [assets, loading],
  );
};

export { useSetFont };
