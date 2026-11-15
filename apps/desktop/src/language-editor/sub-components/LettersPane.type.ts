/* @layer renderer-components @kind types */
import type { LanguageSet } from '@rotp/languages';
import type { GlyphNames } from '../language-editor.type';

type LettersPaneProps = {
  set: LanguageSet | null;
  readOnly: boolean;
  onRename: (names: GlyphNames) => void;
};

export type { LettersPaneProps };
