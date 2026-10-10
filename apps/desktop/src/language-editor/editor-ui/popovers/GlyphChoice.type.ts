/* @layer renderer-components @kind types */
import type { Token } from '@rotp/languages';
import type { GlyphFont, ToolbarItem } from '../editor-ui.type';

type GlyphChoiceProps = {
  item: ToolbarItem;
  font: GlyphFont;
  onPick: (tokens: Token[]) => void;
};

export type { GlyphChoiceProps };
