/* @layer renderer-components @kind types */
import type { GlossaryTerm, SetStructure, Token, Variable } from '@rotp/languages';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { GlyphMetrics, GlyphSheet, RowFit } from '@rotp/languages';

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
