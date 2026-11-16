/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import { loadSetFont } from './load-set-font';
import type { SetFontAssets } from './load-set-font';
import type { SetFontState } from './set-font.type';

const useSetFont = (base: string | undefined): SetFontState => {
  const [assets, setAssets] = useState<SetFontAssets | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(base));

  useEffect(() => {
    if (!base) {
      setAssets(null);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    void loadSetFont(base).then((next) => {
      if (!live) return;
      setAssets(next);
      setLoading(false);
    });
    return () => { live = false; };
  }, [base]);

  return useMemo(
    () => ({ sheet: assets?.sheet ?? null, metrics: assets?.metrics ?? null, loading }),
    [assets, loading],
  );
};

export { useSetFont };
