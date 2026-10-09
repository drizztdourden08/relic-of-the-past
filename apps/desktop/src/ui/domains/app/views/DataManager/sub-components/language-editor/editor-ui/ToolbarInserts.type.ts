/* @layer renderer-components @kind types */
import type { Token, Variable } from '@shared/game/language';
import type { LanguageConfig } from '@rotp/game-data';
import type { GlyphFont } from './editor-ui.type';

type ToolbarInsertsProps = {
  cfg: LanguageConfig;
  variables: Variable[];
  font: GlyphFont;
  disabled: boolean;
  open: string | null;
  onPress: (id: string) => void;
  onInsert: (tokens: Token[]) => void;
};

export type { ToolbarInsertsProps };
