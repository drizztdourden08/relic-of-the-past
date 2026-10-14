/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { LanguageSet } from '@rotp/languages';

type SetApply = (change: (from: LanguageSet) => LanguageSet) => void;

type SetEditsParams = {
  current: RefObject<LanguageSet | null>;
  setSet: (next: LanguageSet) => void;
  markEdited: (next: LanguageSet) => void;
  readOnly: boolean;
};

export type { SetApply, SetEditsParams };
