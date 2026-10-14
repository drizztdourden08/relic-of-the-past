/* @layer renderer-components @kind logic */
import { buildModernBindings } from './build-modern-bindings';
import { controlsForDevice } from './profile-controls';
import { padHexOrNull } from './pad-hex-or-null';
import { presetDeviceFamily } from './preset-device-family';
import { presetMappings } from './preset-mappings';
import type { InputProfile } from '@rotp/input-mapping';
import type { ModernBindings } from '@rotp/game-data';
import type { BuildPresetProfileParams } from './controls-settings.type';

const buildPresetProfile = ({ preset, profile, scheme, entries }: BuildPresetProfileParams): InputProfile => {
  const vid = padHexOrNull(preset.vid) ?? '';
  const pid = padHexOrNull(preset.pid) ?? '';
  const isKeyboard = preset.sdlType === 'keyboard';
  const deviceFamily = presetDeviceFamily(preset.sdlType);

  const modern: ModernBindings | null = scheme === 'modern'
    ? buildModernBindings(isKeyboard ? 'keyboard' : 'gamepad',
        isKeyboard ? [] : controlsForDevice({ vid, pid, sdlType: preset.sdlType }, entries))
    : null;

  return {
    ...profile,
    name: preset.deviceName,
    deviceType: isKeyboard ? 'keyboard' : 'gamepad',
    deviceFamily,
    mappings: presetMappings({ sdlType: preset.sdlType, vid, pid }),
    assignedDevice: isKeyboard ? null : { vendorId: vid, productId: pid, displayName: preset.deviceName, deviceFamily },
    ...(modern ? { modern, core: modern.core } : {}),
    modifiedAt: Date.now(),
  };
};

export { buildPresetProfile };
