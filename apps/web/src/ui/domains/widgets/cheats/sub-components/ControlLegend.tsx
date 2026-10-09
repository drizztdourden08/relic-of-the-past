/* @layer renderer-widgets @kind component */
import { Box, Shortcut, Text } from '@drizztdourden08/tessera/primitives';
import { shortcutOf } from '../behavior/shortcut-of';
import type { ControlLegendProps } from './ControlHint.type';

const ControlLegend = ({ items }: ControlLegendProps) => (
  <Box className="cheats-legend" role="list" aria-label="Controls">
    {items.map((item) => (
      <Box key={`${item.glyph}-${item.label}`} className="cheats-legend__item" role="listitem">
        <Shortcut size="xs" {...shortcutOf(item)} />
        <Text className="cheats-legend__label">{item.label}</Text>
      </Box>
    ))}
  </Box>
);

export { ControlLegend };
