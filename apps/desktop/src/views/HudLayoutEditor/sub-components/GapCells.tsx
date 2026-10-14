/* @layer renderer-components @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ValueField } from './ValueField';
import type { GapCellsProps } from './GapCells.type';

const GapCells = (props: GapCellsProps) => {
  const { gap, onGap, scope, insideRepeat } = props;

  return (
    <Box className="hud-layout-set__gaps">
      {gap.map((cell) => (
        <Box key={cell.axis} className="hud-layout-set__gap">
          <Text className="hud-layout-set__cap" aria-hidden>
            {cell.capIcon ? <Icon name={cell.capIcon} size={14} /> : cell.cap}
          </Text>
          <ValueField
            aria-label={cell.label}
            value={cell.value}
            onChange={(next) => onGap(cell.axis, next)}
            scope={scope}
            insideRepeat={insideRepeat}
            min={0}
          />
        </Box>
      ))}
    </Box>
  );
};

export { GapCells };
