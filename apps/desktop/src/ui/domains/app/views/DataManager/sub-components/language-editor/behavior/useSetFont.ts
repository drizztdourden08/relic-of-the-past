/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import { loadSetFont } from './load-set-font';
import type { SetFontAssets } from './load-set-font';
import type { SetFontState } from './useSetFont.type';

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
