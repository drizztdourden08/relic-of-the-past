/* @layer renderer-lib @kind logic */
import type { InputProfile } from '../../controls/devices/devices.type';
import type { AllowedDevices } from './profile-devices.type';
import { padHex } from './pad-hex';

const allowedDevices = (profile: InputProfile | null): AllowedDevices => {
  const gamepadKeys = new Set<string>();
  if (!profile) return { keyboard: false, gamepadKeys };

  let keyboard = false;
  for (const m of profile.mappings) {
    if (m.binding.type === 'keyboard') {
      keyboard = true;
    } else if (m.sourceVid && m.sourcePid) {
      gamepadKeys.add(`${padHex(m.sourceVid)}:${padHex(m.sourcePid)}`);
    }
  }

  const assigned = profile.assignedDevice;
  if (assigned?.vendorId && assigned.productId) {
    gamepadKeys.add(`${padHex(assigned.vendorId)}:${padHex(assigned.productId)}`);
  }

  return { keyboard, gamepadKeys };
};

export { allowedDevices };
