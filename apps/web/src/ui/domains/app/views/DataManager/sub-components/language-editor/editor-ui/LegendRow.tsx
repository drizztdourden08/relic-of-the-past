/* @layer renderer-components @kind component */
/**
 * One line of the legend: the symbol exactly as the editor draws it, its
 * plain-language name, and what it does — the same three facts the toolbar's
 * tooltip gave when it was inserted, so the two never disagree.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Text } from '@ds/primitives';
import { GlyphChar } from './GlyphChar';
import type { GlyphFont, LegendEntry } from './editor-ui.type';

type LegendRowProps = {
  entry: LegendEntry;
  font: GlyphFont;
};

/** `[Up]` as stored, `Up` as GlyphChar wants it. */
const bareGlyphName = (glyph: string | undefined): string => (glyph ?? '').replace(/^\[|\]$/g, '');

const ICON_PX = 12;

const LegendRow = (props: LegendRowProps) => {
  const { entry, font } = props;

  return (
    <Box className="editor-legend__row">
      <Box className="editor-legend__symbol" aria-hidden="true">
        {entry.icon ? (
          <IconifyIcon icon={entry.icon} width={ICON_PX} height={ICON_PX} />
        ) : (
          <GlyphChar name={bareGlyphName(entry.glyph)} sheet={font.sheet} metrics={font.metrics} />
        )}
      </Box>
      <Text as="span" className="editor-legend__name">{entry.label}</Text>
      <Text as="span" className="editor-legend__what">{entry.description}</Text>
    </Box>
  );
};

export { LegendRow };
export type { LegendRowProps };
