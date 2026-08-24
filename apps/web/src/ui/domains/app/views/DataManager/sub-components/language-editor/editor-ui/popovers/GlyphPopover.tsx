/* @layer renderer-components @kind component */
/**
 * The alphabet's picture characters, as a compact grid.
 *
 * They are characters of the dialogue alphabet, not icons of ours, so they are
 * drawn from the pack's own font and picked by sight — a grid, with nothing
 * between the pictures to read. Which names are characters comes from the
 * language's own alphabet (`toolbar.model.ts`), so a set built on any base
 * offers exactly its own.
 *
 * Holding only buttons, the card keeps the caret alive in the text.
 */
import { Box, Text } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { GlyphChoice } from './GlyphChoice';
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarItem } from '../editor-ui.type';
import './GlyphPopover.css';

type GlyphPopoverProps = {
  label: string;
  /** The alphabet's characters, already merged into whole pictures. */
  items: ToolbarItem[];
  font: GlyphFont;
  onInsert: (tokens: Token[]) => void;
};

const GlyphPopover = (props: GlyphPopoverProps) => {
  const { label, items, font, onInsert } = props;

  return (
    <PopoverShell label={label} keepFocus>
      {items.length === 0 ? (
        <Text as="span" variant="caption" className="popover-shell__empty">
          This alphabet carries none
        </Text>
      ) : null}
      <Box className="glyph-popover__grid">
        {items.map((item) => (
          <GlyphChoice key={item.id} item={item} font={font} onPick={onInsert} />
        ))}
      </Box>
    </PopoverShell>
  );
};

export { GlyphPopover };
export type { GlyphPopoverProps };
