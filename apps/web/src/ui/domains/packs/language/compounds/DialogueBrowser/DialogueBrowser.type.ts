/* @layer renderer-components @kind types */
import type { LanguageSet } from '@shared/game/language';
import type { SetFontAssets } from '../../behavior/set-font-assets';

type BrowserTab = 'dialogue' | 'variables';

type DialogueBrowserProps = {
  set: LanguageSet;
  /** The set's own font; without it the in-game preview is not offered. */
  font: SetFontAssets | null;
  className?: string;
};

export type { BrowserTab, DialogueBrowserProps };
