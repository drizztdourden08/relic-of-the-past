/* @layer renderer-lib @kind hook */
import { useEffect } from 'react';
import { useProfiles } from '@drizztdourden08/brock-react';
import { getLanguageSet } from '../storage/languages-store';
import { NO_LANGUAGE_GRAPHICS, languageAvailabilityOf, useLanguageGraphicsStore } from '../stores/language-graphics-store';

const useLanguageGraphicsRefresh = (): void => {
  const language = useProfiles().active?.language;
  useEffect(() => {
    let cancelled = false;
    const { setAvailability } = useLanguageGraphicsStore.getState();
    if (!language) { setAvailability(NO_LANGUAGE_GRAPHICS); return undefined; }
    getLanguageSet(language)
      .then((set) => { if (!cancelled) setAvailability(languageAvailabilityOf(set)); })
      .catch(() => { if (!cancelled) setAvailability(NO_LANGUAGE_GRAPHICS); });
    return () => { cancelled = true; };
  }, [language]);
};

export { useLanguageGraphicsRefresh };
