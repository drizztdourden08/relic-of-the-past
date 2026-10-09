/* @layer renderer-components @kind types */
import type { DialogueEntry, LanguageSet } from '@shared/game/language';
import type { SetFontAssets, SetVariables } from '../../behavior/language-behavior.type';

type BrowserTab = 'dialogue' | 'variables';

type DialogueBrowserProps = {
  set: LanguageSet;
  font: SetFontAssets | null;
  className?: string;
};

type DialogueListProps = {
  set: LanguageSet;
  font: SetFontAssets | null;
  vars: SetVariables;
};

type VariablesPaneProps = {
  dialogue: DialogueEntry[];
  vars: SetVariables;
};

export type { BrowserTab, DialogueBrowserProps, DialogueListProps, VariablesPaneProps };
