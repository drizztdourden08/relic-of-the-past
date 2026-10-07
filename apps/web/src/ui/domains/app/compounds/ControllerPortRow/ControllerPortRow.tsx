/* @layer renderer-components @kind component */
/**
 * One port of an adapter card: its number, ready/unavailable status, and
 * capabilities. An empty port renders exactly like an occupied one, since
 * whether the two look different hasn't been measured, and a wrong guess
 * would hide a working port.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
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
