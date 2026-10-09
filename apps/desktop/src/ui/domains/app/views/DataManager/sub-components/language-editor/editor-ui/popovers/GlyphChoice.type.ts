/* @layer renderer-components @kind types */
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarItem } from '../editor-ui.type';

type GlyphChoiceProps = {
  item: ToolbarItem;
  font: GlyphFont;
  onPick: (tokens: Token[]) => void;
};

export type { GlyphChoiceProps };
