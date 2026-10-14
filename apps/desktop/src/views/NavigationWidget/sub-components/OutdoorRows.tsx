/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { OutdoorRowsProps } from './GameStatePanel.type';

const OutdoorRows = ({ overworldScreenIndex, isDarkWorld }: OutdoorRowsProps) => (
  <>
    <DescRow label="Screen" desc="The overworld screen index (0x00-0x3F). Grid position: row = upper bits, col = lower bits. Each screen is 512×512 pixels.">
      <Text>{hexLabelOf(overworldScreenIndex, 2)} (R{(overworldScreenIndex >> 3) & 7} C{overworldScreenIndex & 7})</Text>
    </DescRow>
    <DescRow label="World" desc="Light World or Dark World. The two 8×8 overworld grids occupy the same coordinate space but are separate maps.">
      <Text className={isDarkWorld ? 'nav-game-state-panel__dark-world' : 'nav-val-green'}>{isDarkWorld ? 'Dark World' : 'Light World'}</Text>
    </DescRow>
  </>
);

export { OutdoorRows };
