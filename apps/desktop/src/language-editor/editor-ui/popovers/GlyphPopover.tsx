/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { PopoverShell } from './PopoverShell';
import { GlyphChoice } from './GlyphChoice';
import type { GlyphPopoverProps } from './GlyphPopover.type';
import './GlyphPopover.css';

const GlyphPopover = (props: GlyphPopoverProps) => {
  const { label, items, font, onInsert } = props;
  const t = useT();

  return (
    <PopoverShell label={label} keepFocus>
      {items.length === 0 ? (
        <Text as="span" variant="caption" className="popover-shell__empty">
          {t('language-editor:glyph-popover.none')}
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
