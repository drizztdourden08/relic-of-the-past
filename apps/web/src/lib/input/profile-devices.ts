/* @layer renderer-lib @kind logic */
/**
 * Profile Devices — resolves the set of physical devices a profile's map actually
 * references. This is the whitelist the input engine gates on: only a keyboard (when
 * the map has keyboard bindings) and gamepads whose vid:pid appears in the map may
 * drive the game. A connected-but-unmapped controller contributes nothing.
 */

import type { InputProfile } from '@shared/types/controls';

interface AllowedDevices {
  keyboard: boolean;
  gamepadKeys: Set<string>; // "vid:pid", lowercase, 4-hex
}

const padHex = (v: string): string => v.toLowerCase().padStart(4, '0');

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
  if (assigned?.vendorId && assigned?.productId) {
    gamepadKeys.add(`${padHex(assigned.vendorId)}:${padHex(assigned.productId)}`);
  }

  return { keyboard, gamepadKeys };
};

export { allowedDevices };
export type { AllowedDevices };
