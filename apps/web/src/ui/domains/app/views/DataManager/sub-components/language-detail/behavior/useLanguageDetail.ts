/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import type { LanguagePack } from '@shared/types/language';

/** Load the full inspector payload for a language code (re-fetches when code changes). */
const useLanguageDetail = (code: string | null) => {
  const [pack, setPack] = useState<LanguagePack | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) { setPack(null); return; }
    let cancelled = false;
    setLoading(true);
    window.api.getLanguage(code).then((result) => {
      if (cancelled) return;
      setPack(result);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [code]);

  return { pack, loading };
};

export { useLanguageDetail };
