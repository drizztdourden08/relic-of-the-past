/* @layer renderer-components @kind logic */
import { recallControllerName } from '@drizztdourden08/brock-input/renderer';
import { resolveLiveFamilyIcon } from './family-icon-map';
import { FAMILY_ICON_MAP, GENERIC_CONTROLLER_ICON } from './controls-settings.constants';
import { findLiveDevice } from './live-device';
import { splitDeviceKey } from './split-device-key';
import type { DetectedDevice, InputProfile } from '@rotp/input-mapping';
import type { RequiredInput } from './controls-settings.type';

const assignedGamepadInput = (key: string, devices: DetectedDevice[]): RequiredInput => {
  const [vid, pid] = splitDeviceKey(key);
  const liveDevice = findLiveDevice(vid, pid, devices);
  const displayName = recallControllerName({ vendorId: parseInt(vid, 16), productId: parseInt(pid, 16) })
    ?? liveDevice?.displayName ?? 'Controller';
  return {
    type: 'gamepad',
    label: `${displayName} (${vid}:${pid})`,
    iconSrc: resolveLiveFamilyIcon({ vid, pid, devices }),
    connected: Boolean(liveDevice),
  };
};

const gamepadRequiredInputs = (
  profile: InputProfile,
  usedDeviceKeys: ReadonlySet<string>,
  devices: DetectedDevice[],
): RequiredInput[] => {
  if (usedDeviceKeys.size > 0) return [...usedDeviceKeys].map(key => assignedGamepadInput(key, devices));
  return [{
    type: 'gamepad',
    label: profile.name,
    iconSrc: FAMILY_ICON_MAP[profile.deviceFamily] ?? GENERIC_CONTROLLER_ICON,
    connected: devices.some(d => d.type === 'gamepad' && d.connected),
  }];
};

export { gamepadRequiredInputs };
