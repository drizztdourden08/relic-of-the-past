/* @layer shared-storage @kind types */
import type { LanguageSet } from '@shared/game/language';
import type { SetFontBytes } from './types';

type RlangContents = {
  set: LanguageSet;
  font: SetFontBytes | null;
};

export type { RlangContents };
