/* @layer renderer-components @kind types */
import type { LanguageSet } from '@rotp/languages';
import type { GlyphNamingItem } from '@app/compounds/GlyphNamingGrid';
import type { GlyphNames } from '../../language-editor.type';

interface GlyphNamingParams {
  set: LanguageSet | null;
  readOnly: boolean;
  onRename: (names: GlyphNames) => void;
}

interface NameCheck {
  names: GlyphNames;
  taken: ReadonlySet<string>;
}

interface GlyphNamingState {
  glyphs: GlyphNamingItem[];
  names: GlyphNames;
  problems: GlyphNames;
  canSave: boolean;
  setName: (token: string, value: string) => void;
  save: () => void;
}

export type { GlyphNamingParams, GlyphNamingState, NameCheck };
