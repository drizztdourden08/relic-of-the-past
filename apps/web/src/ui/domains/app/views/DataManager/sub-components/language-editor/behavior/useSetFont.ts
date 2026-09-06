/* @layer renderer-components @kind hook */
/**
 * One language set's font, as React state. The read is memoised in
 * load-set-font; the returned object is memoised because consumers feed
 * `sheet`/`metrics` straight into a canvas redraw effect's dependency list.
 */
import { useEffect, useMemo, useState } from 'react';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language/layout/types';
import { loadSetFont } from './load-set-font';
import type { SetFontAssets } from './load-set-font';

/** What a preview needs to draw, plus whether the read is still in flight. */
type SetFontState = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
  loading: boolean;
};

/** Pass `base` (the set's base language code) when the set is already loaded to save a second read. */
const useSetFont = (setId: string | null, base?: string): SetFontState => {
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
    void loadSetFont(setId, base).then((next) => {
      if (!live) return;
      setAssets(next);
      setLoading(false);
    });
    return () => { live = false; };
  }, [setId, base]);

  return useMemo(
    () => ({ sheet: assets?.sheet ?? null, metrics: assets?.metrics ?? null, loading }),
    [assets, loading],
  );
};

export { useSetFont };
export type { SetFontState };
