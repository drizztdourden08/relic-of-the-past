/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { KeyCap } from '@ds/primitives/KeyCap';
import { MouseGlyph } from '@ds/primitives/MouseGlyph';
import { Text } from '@ds/primitives/Text';
import { capLabel } from '../behavior/cap-label';
import { legendEntries } from '../behavior/legend-entries';
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
            {(entry.shortcut.keys ?? []).map((key) => (
              <KeyCap key={key} label={capLabel(key, os)} />
            ))}
            {entry.shortcut.mouse && <MouseGlyph part={entry.shortcut.mouse} />}
            <Text className="hud-grid__key-text">{entry.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { SelectionLegend };
export type { SelectionLegendProps } from './SelectionLegend.type';
