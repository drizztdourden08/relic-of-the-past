/* @layer renderer-components @kind types */
import type { Token, Variable } from '@rotp/languages';
import type { LanguageConfig } from '@rotp/asset-extraction';
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
