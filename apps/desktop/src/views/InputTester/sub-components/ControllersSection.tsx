/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ControllerDeviceList } from './ControllerDeviceList';
import type { ControllersSectionProps } from './ControllersSection.type';

const ControllersSection = (props: ControllersSectionProps) => (
  <Box className="input-cal__section">
    <Box className="input-cal__section-title">Controllers</Box>

    {props.groups.length === 0 && (
      <Box className="input-cal__empty">
        <Text as="p">No controllers detected.</Text>
      </Box>
    )}

    <Box className="input-cal__cards">
      <ControllerDeviceList {...props} />
    </Box>
  </Box>
);

export { ControllersSection };
