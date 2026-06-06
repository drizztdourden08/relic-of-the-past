/**
 * Profile Utilities — create InputProfiles from presets and resolve
 * function mapping display icons.
 */

import type { InputProfile, FunctionMapping, ButtonIcon, DevicePreset } from '@shared/types/controls';
import { findDeviceProfileByVidPid } from '@shared/input';

const profileFromPreset = (preset: DevicePreset): InputProfile => {
  return {
    id: `default-${preset.id}`,
    name: preset.name,
    deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
    deviceFamily: preset.family,
    mappings: [...preset.defaultMappings],
    isDefault: true,
    assignedDevice: null,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
};

const resolveFunctionMappingIcon = (m: FunctionMapping): ButtonIcon | null => {
  if (m.icon) return m.icon;
  if (m.binding.type === 'none' || m.binding.type === 'keyboard') return null;
  const vid = m.sourceVid?.toLowerCase().padStart(4, '0');
  const pid = m.sourcePid?.toLowerCase().padStart(4, '0');
  if (!vid || !pid) return null;
  const profile = findDeviceProfileByVidPid(vid, pid);
  if (!profile) return null;
  if (m.binding.type === 'gamepad-button') {
    const b = profile.buttons[m.binding.index];
    if (b) return { key: b.icon, label: b.label, path: null };
  }
  if (m.binding.type === 'gamepad-axis') {
    const ax = profile.axes?.[m.binding.axisIndex];
    if (ax) {
      const dir = m.binding.direction === '+' ? '+' : '−';
      return { key: `${profile.id}-axis`, label: `${ax.label} ${dir}`, path: null };
    }
  }
  return null;
};

export { profileFromPreset, resolveFunctionMappingIcon };
