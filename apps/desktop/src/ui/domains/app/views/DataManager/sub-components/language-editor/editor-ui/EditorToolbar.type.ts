/* @layer renderer-components @kind types */
import type { StructureMode, Token, Variable } from '@shared/game/language';
import type { LanguageConfig } from '@rotp/game-data';
import type { GlyphFont } from './editor-ui.type';

type EditorToolbarProps = {
  cfg: LanguageConfig;
  variables: Variable[];
  font: GlyphFont;
  settingsTokens: Token[];
  structureMode: StructureMode;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onInsert: (tokens: Token[]) => void;
  onEndBox: () => void;
  onChangeSettings: (next: Token[]) => void;
  onChangeStructureMode: (mode: StructureMode) => void;
};

export type { EditorToolbarProps };
