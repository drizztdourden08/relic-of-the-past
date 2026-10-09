/* @layer renderer-components @kind types */
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarItem } from '../editor-ui.type';

type GlyphPopoverProps = {
  label: string;
  items: ToolbarItem[];
  font: GlyphFont;
  onInsert: (tokens: Token[]) => void;
};

export type { GlyphPopoverProps };
