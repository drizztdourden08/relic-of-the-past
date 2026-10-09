/* @layer renderer-components @kind types */
import type { GlossaryTerm, SetStructure, Token, Variable } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics, GlyphSheet, RowFit } from '@shared/game/language/layout/types';

type EntryEditorProps = {
  tokens: Token[];
  rows: RowFit[];
  cfg: LanguageConfig;
  glossary: GlossaryTerm[];
  variables: Variable[];
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
  structureMode: SetStructure;
  dirty: boolean;
  readOnly?: boolean;
  onChangeTokens: (tokens: Token[]) => void;
  onChangeStructureMode: (mode: SetStructure) => void;
  onSave: () => void;
  onCancel: () => void;
};

export type { EntryEditorProps };
