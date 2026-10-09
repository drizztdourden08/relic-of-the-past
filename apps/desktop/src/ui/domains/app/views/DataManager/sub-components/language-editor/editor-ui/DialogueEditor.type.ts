/* @layer renderer-components @kind types */
import type {
  GlossaryTerm, GlyphMetrics, GlyphSheet, SetStructure, Token, Variable,
} from '@shared/game/language';
import type { LanguageConfig } from '@rotp/game-data';

type DialogueEditorProps = {
  tokens: Token[];
  cfg: LanguageConfig;
  glossary: GlossaryTerm[];
  variables: Variable[];
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
  structureMode: SetStructure;
  readOnly?: boolean;
  onChange: (tokens: Token[]) => void;
  onChangeStructureMode: (mode: SetStructure) => void;
};

export type { DialogueEditorProps };
