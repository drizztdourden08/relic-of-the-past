/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LanguageSet } from '@rotp/languages';
import { getLanguageSet } from '@app/storage/languages-store';
import { errorMessage } from '@app/storage/error-message';

const useSetLoader = (id: string | null, reset: (loaded: LanguageSet | null) => void) => {
  const [set, setSet] = useState<LanguageSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<LanguageSet | null>(null);

  const adopt = useCallback((loaded: LanguageSet | null) => {
    current.current = loaded;
    setSet(loaded);
    reset(loaded);
  }, [reset]);

  useEffect(() => {
    if (!id) { adopt(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLanguageSet(id)
      .then((loaded) => {
        if (cancelled) return;
        adopt(loaded);
        if (!loaded) setError(`Language set "${id}" was not found.`);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        adopt(null);
        setError(errorMessage(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [adopt, id]);

  return { set, setSet, current, loading, error };
};

export { useSetLoader };
