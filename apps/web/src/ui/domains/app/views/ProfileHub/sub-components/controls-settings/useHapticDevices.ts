/* @layer renderer-components @kind hook */
/**
 * useHapticDevices — manages the per-device haptics enable map. A device that
 * supports vibration is enabled by default; the settings only store explicit
 * overrides. Devices are enabled by dropping them onto the haptics box and muted
 * by removing their chip.
 */

import { useState, useCallback, useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { DetectedDevice } from '@shared/types/controls';
import { findController, findControllerById } from '@shared/input/register-all';
import { padHex } from './controls-settings.type';

interface UseHapticDevicesArgs {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  devices: DetectedDevice[];
}

interface HapticDeviceChip {
  key: string;
  label: string;
}

const supportsVibration = (device: DetectedDevice): boolean => {
  const ctrl = device.presetId
    ? findControllerById(device.presetId)
    : device.vendorId && device.productId
      ? findController(device.vendorId, device.productId)
      : null;
  return ctrl?.supportsVibration() ?? false;
};

const useHapticDevices = ({ settings, onChange, devices }: UseHapticDevicesArgs) => {
  const [hapticDragOver, setHapticDragOver] = useState(false);

  const hapticEnabledDevices = useMemo<HapticDeviceChip[]>(() => {
    const overrides = settings.hapticDevices ?? {};
    return devices
      .filter(d => d.type === 'gamepad' && d.vendorId && d.productId && supportsVibration(d))
      .map(d => ({ key: `${padHex(d.vendorId!)}:${padHex(d.productId!)}`, label: d.displayName }))
      .filter(chip => overrides[chip.key] !== false);
  }, [devices, settings.hapticDevices]);

  const handleHapticDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-vid')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setHapticDragOver(true);
    }
  }, []);

  const handleHapticDragLeave = useCallback(() => setHapticDragOver(false), []);

  const handleHapticDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setHapticDragOver(false);
    const vid = e.dataTransfer.getData('application/x-vid');
    const pid = e.dataTransfer.getData('application/x-pid');
    if (!vid || !pid) return;
    const key = `${padHex(vid)}:${padHex(pid)}`;
    // Clearing the override returns the device to its default (enabled when supported).
    const next = { ...(settings.hapticDevices ?? {}) };
    delete next[key];
    onChange({ hapticDevices: next });
  }, [settings.hapticDevices, onChange]);

  const disableHaptics = useCallback((key: string) => {
    onChange({ hapticDevices: { ...(settings.hapticDevices ?? {}), [key]: false } });
  }, [settings.hapticDevices, onChange]);

  return {
    hapticEnabledDevices,
    hapticDragOver,
    handleHapticDragOver,
    handleHapticDragLeave,
    handleHapticDrop,
    disableHaptics,
  };
};

export { useHapticDevices };
export type { HapticDeviceChip };
