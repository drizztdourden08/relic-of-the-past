/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import type { InputProfile } from '@rotp/input-mapping';
import type { DeviceFamily, ModernBindings } from '@rotp/game-data';
import { KEYBOARD_DEFAULT, buildConsoleDefaultMappings } from '@rotp/input-mapping';
import { buildDisplayContext, resolveBrandLogoKey } from '@rotp/input-mapping';
import type { SdlGamepadType } from '@rotp/input-mapping';
import { buildModernBindings } from './build-modern-bindings';
import { controlsForDevice } from './profile-controls';
import { padHex } from './pad-hex';
import {
  DRAG_DEVICE_ID, DRAG_DEVICE_NAME, DRAG_PID, DRAG_SDL_TYPE, DRAG_VID,
} from './controls-settings.constants';
import type { PendingPreset, UseDragDropArgs } from './controls-settings.type';

const useDragDrop = ({ devices, entries, scheme, activeProfile, updateActiveProfile }: UseDragDropArgs) => {
  const [dragOverBindings, setDragOverBindings] = useState(false);
  const [confirmPreset, setConfirmPreset] = useState<PendingPreset | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_SDL_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOverBindings(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverBindings(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBindings(false);

    const sdlType = e.dataTransfer.getData(DRAG_SDL_TYPE);
    const deviceId = e.dataTransfer.getData(DRAG_DEVICE_ID);
    const deviceName = e.dataTransfer.getData(DRAG_DEVICE_NAME);
    const vid = e.dataTransfer.getData(DRAG_VID);
    const pid = e.dataTransfer.getData(DRAG_PID);
    if (!sdlType) return;

    const device = devices.find(d => d.id === deviceId);
    setConfirmPreset({
      sdlType,
      deviceName: deviceName || device?.displayName || 'Unknown Device',
      vid: vid || device?.vendorId || '',
      pid: pid || device?.productId || '',
    });
  }, [devices]);

  const handleApplyPreset = useCallback(() => {
    if (!confirmPreset || !activeProfile) return;

    const vid = confirmPreset.vid ? padHex(confirmPreset.vid) : '';
    const pid = confirmPreset.pid ? padHex(confirmPreset.pid) : '';
    const isKeyboard = confirmPreset.sdlType === 'keyboard';

    const defaultMappings = isKeyboard
      ? KEYBOARD_DEFAULT.defaultMappings
      : buildConsoleDefaultMappings({ sdlType: confirmPreset.sdlType as SdlGamepadType, vendorId: vid, productId: pid });

    const deviceFamily: DeviceFamily = isKeyboard
      ? 'keyboard'
      : (resolveBrandLogoKey(buildDisplayContext({ sdlType: confirmPreset.sdlType as SdlGamepadType })) || 'generic') as DeviceFamily;

    const mappingsWithSource = defaultMappings.map(m => ({
      ...m,
      icon: null,
      sourceVid: m.binding.type !== 'keyboard' ? vid : null,
      sourcePid: m.binding.type !== 'keyboard' ? pid : null,
    }));

    const modern: ModernBindings | null = scheme === 'modern'
      ? buildModernBindings(isKeyboard ? 'keyboard' : 'gamepad',
          isKeyboard ? [] : controlsForDevice({ vid, pid, sdlType: confirmPreset.sdlType }, entries))
      : null;

    const updatedProfile: InputProfile = {
      ...activeProfile,
      name: confirmPreset.deviceName,
      deviceType: isKeyboard ? 'keyboard' : 'gamepad',
      deviceFamily,
      mappings: mappingsWithSource,
      assignedDevice: isKeyboard ? null : {
        vendorId: vid,
        productId: pid,
        displayName: confirmPreset.deviceName,
        deviceFamily,
      },
      ...(modern ? { modern, core: modern.core } : {}),
      modifiedAt: Date.now(),
    };

    updateActiveProfile(updatedProfile);
    setConfirmPreset(null);
  }, [confirmPreset, activeProfile, updateActiveProfile, scheme, entries]);

  return {
    dragOverBindings,
    confirmPreset,
    setConfirmPreset,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleApplyPreset,
  };
};

export { useDragDrop };
