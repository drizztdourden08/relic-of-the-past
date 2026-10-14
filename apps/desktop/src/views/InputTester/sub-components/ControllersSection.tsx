/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ControllerDeviceList } from './ControllerDeviceList';
import type { ControllersSectionProps } from './ControllersSection.type';

const ControllersSection = (props: ControllersSectionProps) => {
  const { connectedCount, entries, controllerStates, onReportDevice } = props;

  return (
    <Box className="input-cal__section">
      <Box className="input-cal__section-title">Controllers</Box>

      {connectedCount === 0 && (
        <Box className="input-cal__empty">
          <Text as="p">No controllers detected.</Text>
        </Box>
      )}

      <Box className="input-cal__cards">
        <ControllerDeviceList entries={entries} controllerStates={controllerStates} onReportDevice={onReportDevice} />
      </Box>
    </Box>
  );
};

export { ControllersSection };
