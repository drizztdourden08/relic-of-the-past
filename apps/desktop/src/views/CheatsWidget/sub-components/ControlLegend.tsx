/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Shortcut, Text } from '@drizztdourden08/tessera/primitives';
import { shortcutOf } from '../behavior/shortcut-of';
import type { ControlLegendProps } from './ControlHint.type';

const ControlLegend = ({ items }: ControlLegendProps) => {
  const t = useT();
  const text = useText();
  return (
    <Box className="cheats-legend" role="list" aria-label={t('views-cheats:legend.label')}>
      {items.map((item) => (
        <Box key={`${item.glyph}-${text(item.label)}`} className="cheats-legend__item" role="listitem">
          <Shortcut size="xs" {...shortcutOf(item)} />
          <Text className="cheats-legend__label">{text(item.label)}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { ControlLegend };
