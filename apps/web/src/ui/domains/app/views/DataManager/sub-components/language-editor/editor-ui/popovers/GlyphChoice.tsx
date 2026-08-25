/* @layer renderer-components @kind component */
/**
 * One picture character in the grid, drawn with the game's own pixels rather
 * than a lookalike from an icon set — the button previews exactly what will
 * land in the line.
 *
 * A character the alphabet spells as a pair of entries draws as one picture and
 * inserts both tokens, which is what its maker already returns.
 */
import { useCallback } from 'react';
import { IconButton } from '@ds/primitives';
import { GlyphChar } from '../GlyphChar';
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarItem } from '../editor-ui.type';

/** `[Up]` as the item stores it, `Up` as the drawing code asks for it. */
const bareGlyphName = (glyph: string | undefined): string => (glyph ?? '').replace(/^\[|\]$/g, '');

type GlyphChoiceProps = {
  item: ToolbarItem;
  font: GlyphFont;
  onPick: (tokens: Token[]) => void;
};

const GlyphChoice = (props: GlyphChoiceProps) => {
  const { item, font, onPick } = props;

  const handleClick = useCallback(() => onPick(item.make(null)), [item, onPick]);

  return (
    <IconButton
      className="glyph-popover__cell"
      variant="ghost"
      size="sm"
      label={item.label}
      onClick={handleClick}
    >
      <GlyphChar
        name={bareGlyphName(item.glyph)}
        sheet={font.sheet}
        metrics={font.metrics}
      />
    </IconButton>
  );
};

export { GlyphChoice };
export type { GlyphChoiceProps };
