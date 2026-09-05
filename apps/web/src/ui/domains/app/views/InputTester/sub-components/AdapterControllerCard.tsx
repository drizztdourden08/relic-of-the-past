/* @layer renderer-components @kind component */
/**
 * One card with a port list for a multi-port adapter. Every port shows, occupied or not: there is
 * no reliable way yet to tell an empty port from a resting controller.
 */
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { ControllerPortRow } from '../../../compounds/ControllerPortRow';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';
import { UnavailableControllerNotice } from '../../../compounds/UnavailableControllerNotice';
import { controllerCardInfo } from '../../../../../../lib/input/controller-card-info';
import type { ControllerDeviceGroup } from '../../../../../../lib/input/controller-device-groups';
import { CONTROLLER_ICON_MAP } from './input-cal-visuals';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';

interface AdapterControllerCardProps {
  group: ControllerDeviceGroup;
  controllerStates: Map<string, ControllerInputState>;
  onAddMapping: (mapping: string) => Promise<boolean>;
}

const liveHintFor = (state: ControllerInputState | undefined): string | undefined => {
  if (!state) return undefined;
  return `btn=${state.buttons.filter(Boolean).length}/${state.buttons.length}`;
};

const AdapterControllerCard = (props: AdapterControllerCardProps) => {
  const { group, controllerStates, onAddMapping } = props;
  const info = controllerCardInfo(group.ports[0].entry);
  const icon = CONTROLLER_ICON_MAP[info.deviceFamily];
  const hasUnavailablePort = group.ports.some((port) => port.entry.status === 'unavailable');

  return (
    <Box className="input-cal__card">
      <Box className="input-cal__card-header">
        {icon && <Image src={icon} alt="" draggable={false} width={28} height={28} />}
        <Text className="input-cal__card-name">{info.displayName}</Text>
        <Text className="input-cal__card-badge">Adapter</Text>
      </Box>
      <ControllerStatusBar idLabel={`${info.vendorId}:${info.productId}`} />
      <Box className="adapter-controller-card__ports">
        {group.ports.map((port) => (
          <ControllerPortRow
            key={`${group.vendorId}:${group.productId}:${port.portNumber}`}
            portNumber={port.portNumber}
            status={port.entry.status}
            busType={port.entry.busType}
            hasRumble={port.entry.hasRumble}
            hasGyro={port.entry.hasGyro}
            liveHint={port.entry.status === 'ready' ? liveHintFor(controllerStates.get(port.deviceKey)) : undefined}
          />
        ))}
      </Box>
      {hasUnavailablePort && <UnavailableControllerNotice onAddMapping={onAddMapping} />}
    </Box>
  );
};

export { AdapterControllerCard };
