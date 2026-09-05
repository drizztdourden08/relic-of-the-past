/* @layer renderer-components @kind hook */
/**
 * Derived display data: requiredInputs and displayMappings.
 */

import { useMemo } from 'react';
import type { InputProfile, DetectedDevice } from '@shared/types/controls';
import { SNES_BUTTONS } from '@shared/types/controls';
import { allowedDevices } from '@app/lib/input/profile-devices';
import { recallControllerName } from '@app/lib/input/controller-name-cache';
import { resolveIconByVidPid } from '@app/lib/input/profile-utils';
import { FAMILY_ICON_MAP, resolveLiveFamilyIcon } from './family-icon-map';
import { padHex } from './controls-settings.type';

interface UseDisplayMappingsArgs {
  activeProfile: InputProfile | null;
  devices: DetectedDevice[];
}

/** The live device (if any) currently plugged in at this vid:pid. */
const findLiveDevice = (vid: string, pid: string, devices: DetectedDevice[]): DetectedDevice | undefined =>
  devices.find(d =>
    d.type === 'gamepad' && d.connected &&
    d.vendorId && d.productId &&
    padHex(d.vendorId) === vid && padHex(d.productId) === pid
  );

const useDisplayMappings = ({ activeProfile, devices }: UseDisplayMappingsArgs) => {
  const requiredInputs = useMemo(() => {
    if (!activeProfile) return [];
    const inputs: Array<{ type: 'keyboard' | 'gamepad'; label: string; iconSrc: string; connected: boolean }> = [];
    const { keyboard: hasKeyboard, gamepadKeys: usedDeviceKeys } = allowedDevices(activeProfile);
    const hasGamepad = activeProfile.mappings.some(m => m.binding.type !== 'keyboard');

    if (hasKeyboard) {
      inputs.push({
        type: 'keyboard',
        label: 'Keyboard',
        iconSrc: FAMILY_ICON_MAP.keyboard,
        connected: devices.some(d => d.type === 'keyboard' && d.connected),
      });
    }
    if (hasGamepad) {
      if (usedDeviceKeys.size > 0) {
        for (const key of usedDeviceKeys) {
          const [vid, pid] = key.split(':');
          const liveDevice = findLiveDevice(vid, pid, devices);
          const displayName = recallControllerName({ vendorId: parseInt(vid, 16), productId: parseInt(pid, 16) })
            ?? liveDevice?.displayName ?? 'Controller';
          inputs.push({
            type: 'gamepad',
            label: `${displayName} (${vid}:${pid})`,
            iconSrc: resolveLiveFamilyIcon({ vid, pid, devices }),
            connected: !!liveDevice,
          });
        }
      } else {
        const family = activeProfile.deviceFamily;
        inputs.push({
          type: 'gamepad',
          label: activeProfile.name,
          iconSrc: FAMILY_ICON_MAP[family] ?? FAMILY_ICON_MAP.generic,
          connected: devices.some(d => d.type === 'gamepad' && d.connected),
        });
      }
    }
    return inputs;
  }, [activeProfile, devices]);

  // More than one physical controller feeding this profile's bindings, so each
  // binding row then also shows which one it came from (see BindingRow's
  // deviceIconUrl). A single-controller profile never needs that disambiguation.
  const multiController = useMemo(() => allowedDevices(activeProfile).gamepadKeys.size > 1, [activeProfile]);

  const displayMappings = useMemo(() => {
    return SNES_BUTTONS.map(btn => {
      const existing = activeProfile?.mappings.find(m => m.snesButton === btn);
      if (!existing) {
        return { snesButton: btn, binding: { type: 'none' as const }, icon: null, deviceIconUrl: null };
      }
      if (existing.binding.type === 'none' || existing.binding.type === 'keyboard') {
        return { ...existing, icon: null, deviceIconUrl: null };
      }

      const vid = existing.sourceVid ? padHex(existing.sourceVid) : null;
      const pid = existing.sourcePid ? padHex(existing.sourcePid) : null;
      if (!vid || !pid) {
        return { ...existing, icon: existing.icon?.key ? existing.icon : null, deviceIconUrl: null };
      }

      const deviceIconUrl = multiController ? resolveLiveFamilyIcon({ vid, pid, devices }) : null;
      if (existing.icon?.key && existing.binding.type === 'gamepad-axis') {
        return { ...existing, deviceIconUrl };
      }
      const liveSdlType = findLiveDevice(vid, pid, devices)?.sdlType;
      const icon = resolveIconByVidPid(vid, pid, existing.binding, liveSdlType);
      return { ...existing, icon, deviceIconUrl };
    });
  }, [activeProfile, devices, multiController]);

  return { requiredInputs, displayMappings };
};

export { useDisplayMappings };
