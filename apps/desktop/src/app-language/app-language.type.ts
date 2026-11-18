/* @layer renderer-lib @kind types */
interface AppLanguageChoice {
  tag: string;
  name: string;
}

interface AppLanguageStore {
  language: string;
  setLanguage: (tag: string) => void;
}

export type { AppLanguageChoice, AppLanguageStore };
