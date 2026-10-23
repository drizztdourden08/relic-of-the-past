/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { AxisReadoutProps } from './AxisReadout.type';
import './AxisReadout.css';

const AxisReadout = ({ name, variant, plot, actions, children }: AxisReadoutProps) => (
  <Box className="axis-readout" data-variant={variant}>
    {plot}
    <Box className="axis-readout__body">
      <Text className="axis-readout__name">{name}</Text>
      {children}
      <Box className="axis-readout__actions">{actions}</Box>
    </Box>
  </Box>
);

export { AxisReadout };
