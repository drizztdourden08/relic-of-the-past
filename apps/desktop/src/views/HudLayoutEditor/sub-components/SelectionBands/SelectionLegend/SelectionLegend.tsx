/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { legendEntries } from '../behavior/legend-entries';
import { PointerCaps } from './PointerCaps';
import '../HudLayoutEditor.bands.css';
import type { SelectionLegendProps } from './SelectionLegend.type';

const SelectionLegend = (props: SelectionLegendProps) => {
  const { actions, os, status, refusal } = props;
  return (
    <Box className="hud-grid__legend">
      <Text className="hud-grid__status" role="status" title={refusal ?? status}>{refusal ?? status}</Text>
      <Box className="hud-grid__keys">
        {legendEntries(actions).map((entry) => (
          <Box key={entry.key} className="hud-grid__key" data-shortcut={entry.key}>
            <PointerCaps shortcut={entry.shortcut} os={os} />
            <Text className="hud-grid__key-text">{entry.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { SelectionLegend };
export type { SelectionLegendProps } from './SelectionLegend.type';
