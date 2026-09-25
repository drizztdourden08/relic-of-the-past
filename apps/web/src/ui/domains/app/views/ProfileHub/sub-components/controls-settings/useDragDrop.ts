/* @layer renderer-components @kind hook */
/**
 * Drag-over/drop handling and "apply console defaults".
 *
 * A dropped device carries only its sdlType (plus vid/pid) now, and there is no
 * per-model preset any more. The keyboard is the one sentinel case (sdlType
 * 'keyboard', see device-detector.ts) still resolved from its own hand-authored
 * KEYBOARD_DEFAULT; every gamepad's defaults come from the family layer's
 * consoleDefaults via buildConsoleDefaultMappings.
 *
 * Under the modern scheme the same drop ALSO gives the profile its modern
 * bindings, derived from what SDL says the dropped device actually has. The
 * classic console-default mappings are written either way and are untouched by
 * this: the two live side by side on the profile, so switching schemes back
 * never has to rebuild the other one.
 */

import { useState, useCallback } from 'react';
import type { InputProfile, DetectedDevice, DeviceFamily, ModernBindings } from '@shared/types/controls';
import type { ControlSchemeId } from '@shared/input/scheme';
import type { DeviceEntry } from '@shared/ipc';
import { KEYBOARD_DEFAULT, buildConsoleDefaultMappings } from '@shared/input';
import { buildDisplayContext, resolveBrandLogoKey } from '@shared/input/family';
import type { SdlGamepadType } from '@shared/input/family';
import { buildModernBindings } from './build-modern-bindings';
import { controlsForDevice } from './profile-controls';
import { padHex } from './controls-settings.type';

interface UseDragDropArgs {
  devices: DetectedDevice[];
  entries: DeviceEntry[];
  scheme: ControlSchemeId;
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
}

const useDragDrop = ({ devices, entries, scheme, activeProfile, updateActiveProfile }: UseDragDropArgs) => {
  const [dragOverBindings, setDragOverBindings] = useState(false);
  const [confirmPreset, setConfirmPreset] = useState<{ sdlType: string; deviceName: string; vid: string; pid: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-sdl-type')) {
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

    const sdlType = e.dataTransfer.getData('application/x-sdl-type');
    const deviceId = e.dataTransfer.getData('application/x-device-id');
    const deviceName = e.dataTransfer.getData('application/x-device-name');
    const vid = e.dataTransfer.getData('application/x-vid');
    const pid = e.dataTransfer.getData('application/x-pid');
    if (!sdlType) return;

    // The dragged card carries its own resolved name (device-drag-data.ts),
    // only a legacy drag source without one falls back to the device list.
    const device = devices.find(d => d.id === deviceId);
    setConfirmPreset({
      sdlType,
      deviceName: deviceName || device?.displayName || 'Unknown Device',
      vid: vid || device?.vendorId || '',
      pid: pid || device?.productId || '',
    });
  }, [devices]);

  // ─── Apply console defaults ───
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

    // Icons are never stored on a freshly-applied binding, since they resolve live
    // from sourceVid/sourcePid + the binding's index (see useDisplayMappings.ts),
    // the same as any other saved binding.
    const mappingsWithSource = defaultMappings.map(m => ({
      ...m,
      icon: null,
      sourceVid: m.binding.type !== 'keyboard' ? vid : null,
      sourcePid: m.binding.type !== 'keyboard' ? pid : null,
    }));

    // Modern bindings come from the dropped device's own resolved controls.
    // A device with nothing to resolve from (never seen by SDL, no remembered
    // type) yields null and keeps whatever the profile already had.
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
