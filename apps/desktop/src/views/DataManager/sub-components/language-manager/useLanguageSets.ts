/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { LanguageSetSummary } from '@rotp/languages';
import * as languagesStore from '@app/storage/languages-store';

const useLanguageSets = () => {
  const [languages, setLanguages] = useState<LanguageSetSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const langs = await languagesStore.listLanguageSets();
    setLanguages(langs);
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const refreshThenSelect = useCallback((code: string) => {
    void refresh().then(() => setSelected(code));
  }, [refresh]);

  return { languages, loading, selected, setSelected, refresh, refreshThenSelect };
};

export { useLanguageSets };
