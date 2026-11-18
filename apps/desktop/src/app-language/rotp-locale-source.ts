/* @layer renderer-lib @kind logic */
import type { LocaleSource } from '@drizztdourden08/brock-react';
import { useProfilesStore } from '@drizztdourden08/brock-react';
import { readAppLanguage } from './app-language-file';
import { effectiveAppLanguage } from './effective-app-language';
import { tellMainLanguage } from './tell-main-language';
import { useAppLanguageStore } from './useAppLanguageStore';

const rotpLocaleSource: LocaleSource = {
  initial: async () => {
    useAppLanguageStore.setState({ language: await readAppLanguage() });
    const tag = effectiveAppLanguage();
    tellMainLanguage(tag);
    return tag;
  },
  set: (pref) => {
    useAppLanguageStore.getState().setLanguage(pref);
    return Promise.resolve();
  },
  subscribe: (listener) => {
    let last = effectiveAppLanguage();
    const notify = (): void => {
      const next = effectiveAppLanguage();
      if (next === last) return;
      last = next;
      tellMainLanguage(next);
      listener(next);
    };
    const offGlobal = useAppLanguageStore.subscribe(notify);
    const offProfile = useProfilesStore.subscribe(notify);
    return () => {
      offGlobal();
      offProfile();
    };
  },
};

export { rotpLocaleSource };
