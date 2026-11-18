/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { DEFAULT_APP_LANGUAGE } from './app-language.constants';
import type { AppLanguageStore } from './app-language.type';
import { writeAppLanguage } from './write-app-language';

const useAppLanguageStore = create<AppLanguageStore>()((set) => ({
  language: DEFAULT_APP_LANGUAGE,
  setLanguage: (tag) => {
    set({ language: tag });
    void writeAppLanguage(tag);
  },
}));

export { useAppLanguageStore };
