/* @layer renderer-components @kind logic */
import type { LanguageMeta } from '@shared/types/language';

/** A run within a dialogue line: literal text or a bracketed control token. */
interface DialogueToken {
  type: 'text' | 'code';
  value: string;
}

interface LanguageDetailProps {
  /** Language code to inspect, or null when nothing is selected. */
  code: string | null;
  /** Display name for the selected language. */
  name: string;
}

interface FontSheetProps {
  tiles: number[];
  glyphCount: number;
}

interface LanguageMetaPanelProps {
  meta: LanguageMeta;
  name: string;
}

export type { DialogueToken, LanguageDetailProps, FontSheetProps, LanguageMetaPanelProps };
