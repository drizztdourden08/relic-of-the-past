/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ByteGridLegendProps } from './ByteGrid.type';

const ByteGridLegend = (props: ByteGridLegendProps) => {
  const { gyroState, stickPickMode, triggerPickMode } = props;

  return (
    <Box className="hid-cal__byte-legend">
      <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--unknown" /> Unknown</Text>
      <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--excluded" /> Excluded</Text>
      <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--stick" /> Stick</Text>
      <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--trigger" /> Trigger</Text>
      <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--button" /> Button</Text>
      <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--changed" /> Changed (top edge, by amount)</Text>
      {gyroState === 'recording' && (
        <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--gyro" /> Gyro</Text>
      )}
      {stickPickMode && (
        <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--selected" /> Selected</Text>
      )}
      {triggerPickMode && (
        <Text><Text className="hid-cal__legend-swatch hid-cal__legend-swatch--selected" /> Selected</Text>
      )}
    </Box>
  );
};

export { ByteGridLegend };
