/* @layer renderer-widgets @kind component */
/**
 * The legend under a tab: every input the tab answers to, drawn as its glyph with what it does
 * beside it, in two columns.
 */
import { Box, Text } from '@ds/primitives';
import { ControlGlyph } from './ControlGlyph';
import type { ControlHint } from './ControlGlyph.type';

type ControlLegendProps = {
  items: readonly ControlHint[];
};

const ControlLegend = ({ items }: ControlLegendProps) => (
  <Box className="cheats-legend" role="list" aria-label="Controls">
    {items.map((item) => (
      <Box key={`${item.glyph}-${item.label}`} className="cheats-legend__item" role="listitem">
        <ControlGlyph kind={item.glyph} keyName={item.keyName} />
        <Text className="cheats-legend__label">{item.label}</Text>
      </Box>
    ))}
  </Box>
);

export { ControlLegend };
export type { ControlLegendProps };
