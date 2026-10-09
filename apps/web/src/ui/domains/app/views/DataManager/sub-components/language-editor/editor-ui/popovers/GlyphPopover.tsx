/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PopoverShell } from './PopoverShell';
import { GlyphChoice } from './GlyphChoice';
import { NONE_CARRIED } from './GlyphPopover.constants';
import type { GlyphPopoverProps } from './GlyphPopover.type';
import './GlyphPopover.css';

const GlyphPopover = (props: GlyphPopoverProps) => {
  const { label, items, font, onInsert } = props;

  return (
    <PopoverShell label={label} keepFocus>
      {items.length === 0 ? (
        <Text as="span" variant="caption" className="popover-shell__empty">
          {NONE_CARRIED}
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
