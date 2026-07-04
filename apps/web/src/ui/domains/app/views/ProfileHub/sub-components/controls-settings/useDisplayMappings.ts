/* @layer renderer-components @kind hook */
/**
 * useDisplayMappings — derived display data: requiredInputs & displayMappings.
 */

import { useMemo } from 'react';
import type { InputProfile, DetectedDevice } from '@shared/types/controls';
import { SNES_BUTTONS } from '@shared/types/controls';
import { findDeviceProfileByVidPid } from '@shared/input';
import { publicAsset } from '@app/lib/assets/public-asset';
import { allowedDevices } from '@app/lib/input/profile-devices';
import { padHex } from './controls-settings.type';

interface UseDisplayMappingsArgs {
  activeProfile: InputProfile | null;
  devices: DetectedDevice[];
}

const useDisplayMappings = ({ activeProfile, devices }: UseDisplayMappingsArgs) => {
  const requiredInputs = useMemo(() => {
    if (!activeProfile) return [];
    const inputs: Array<{ type: 'keyboard' | 'gamepad'; label: string; iconSrc: string; connected: boolean }> = [];
    const { keyboard: hasKeyboard, gamepadKeys: usedDeviceKeys } = allowedDevices(activeProfile);
    const hasGamepad = activeProfile.mappings.some(m => m.binding.type !== 'keyboard');

    const familyIconMap: Record<string, string> = {
      xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
      nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
      playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
      keyboard: publicAsset('buttons/keyboard/keyboard.svg'),
      generic: publicAsset('buttons/generic/generic_joystick.svg'),
    };

    if (hasKeyboard) {
      inputs.push({
        type: 'keyboard',
        label: 'Keyboard',
        iconSrc: familyIconMap.keyboard,
        connected: devices.some(d => d.type === 'keyboard' && d.connected),
      });
    }
    if (hasGamepad) {
      if (usedDeviceKeys.size > 0) {
        for (const key of usedDeviceKeys) {
          const [vid, pid] = key.split(':');
          const liveDevice = devices.find(d =>
            d.type === 'gamepad' && d.connected &&
            d.vendorId && d.productId &&
            padHex(d.vendorId) === vid && padHex(d.productId) === pid
          );
          const profile = findDeviceProfileByVidPid(vid, pid);
          const family = profile?.family ?? liveDevice?.deviceFamily ?? 'generic';
          const icon = familyIconMap[family] ?? familyIconMap.generic;
          const displayName = profile?.name ?? liveDevice?.displayName ?? 'Controller';
          inputs.push({
            type: 'gamepad',
            label: `${displayName} (${vid}:${pid})`,
            iconSrc: icon,
            connected: !!liveDevice,
          });
        }
      } else {
        const family = activeProfile.deviceFamily;
        const icon = familyIconMap[family] ?? familyIconMap.generic;
        inputs.push({
          type: 'gamepad',
          label: activeProfile.name,
          iconSrc: icon,
          connected: devices.some(d => d.type === 'gamepad' && d.connected),
        });
      }
    }
    return inputs;
  }, [activeProfile, devices]);

  const displayMappings = useMemo(() => {
    return SNES_BUTTONS.map(btn => {
      const existing = activeProfile?.mappings.find(m => m.snesButton === btn);
      if (!existing) {
        return { snesButton: btn, binding: { type: 'none' as const }, icon: null };
      }
      if (existing.binding.type === 'none' || existing.binding.type === 'keyboard') return { ...existing, icon: null };

      const vid = existing.sourceVid ? padHex(existing.sourceVid) : null;
      const pid = existing.sourcePid ? padHex(existing.sourcePid) : null;
      if (!vid || !pid) {
        return existing.icon?.key ? existing : { ...existing, icon: null };
      }

      const profile = findDeviceProfileByVidPid(vid, pid);
      if (!profile) return { ...existing, icon: null };

      if (existing.binding.type === 'gamepad-button') {
        const b = profile.buttons[existing.binding.index];
        if (b) return { ...existing, icon: { key: b.icon, label: b.label, path: null } };
      }
      if (existing.binding.type === 'gamepad-axis') {
        if (existing.icon?.key) return existing;
        const ax = profile.axes?.[existing.binding.axisIndex];
        if (ax) {
          const dir = existing.binding.direction === '+' ? '+' : '\u2212';
          return { ...existing, icon: { key: `${profile.id}-axis`, label: `${ax.label} ${dir}`, path: null } };
        }
      }
      return { ...existing, icon: null };
    });
  }, [activeProfile]);

  return { requiredInputs, displayMappings };
};

export { useDisplayMappings };
