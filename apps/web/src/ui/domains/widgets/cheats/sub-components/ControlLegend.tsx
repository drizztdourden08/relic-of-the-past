/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ControlGlyph } from './ControlGlyph';
import type { ControlLegendProps } from './ControlGlyph.type';

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
