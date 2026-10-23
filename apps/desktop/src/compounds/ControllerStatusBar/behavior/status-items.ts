/* @layer renderer-components @kind logic */
import type { ControllerStatusBarProps, StatusItemProps } from '../ControllerStatusBar.type';
import { busLookOf } from './bus-look';
import { capabilityItem } from './capability-item';
import { detectedItem } from './detected-item';
import { linkLookOf } from './link-look';

const statusItemsOf = (props: ControllerStatusBarProps): StatusItemProps[] => {
  const { busType, connectionState, hasRumble, hasGyro, detected, showAbsent = false } = props;
  const items = [
    detectedItem(detected),
    busLookOf(busType),
    linkLookOf(connectionState),
    capabilityItem('rumble', hasRumble, showAbsent),
    capabilityItem('gyro', hasGyro, showAbsent),
  ];
  return items.filter((item): item is StatusItemProps => item !== null);
};

export { statusItemsOf };
