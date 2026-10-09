/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ControllerStatusBadge } from '../ControllerStatusBadge';
import { ControllerCapabilityBadges } from '../ControllerCapabilityBadges';
import type { ControllerPortRowProps } from './ControllerPortRow.type';
import './ControllerPortRow.css';

const ControllerPortRow = (props: ControllerPortRowProps) => {
  const { portNumber, status, busType, hasRumble, hasGyro, liveHint } = props;
  return (
    <Box className="controller-port-row">
      <Text className="controller-port-row__label">Port {portNumber}</Text>
      <ControllerStatusBadge status={status} />
      <ControllerCapabilityBadges busType={busType} hasRumble={hasRumble} hasGyro={hasGyro} />
      {liveHint && <Text className="controller-port-row__live">{liveHint}</Text>}
    </Box>
  );
};

export { ControllerPortRow };
