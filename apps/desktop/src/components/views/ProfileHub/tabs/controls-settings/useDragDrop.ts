/**
 * useDragDrop — drag-over/drop handling and preset application.
 */

import { useState, useCallback } from 'react';
import type { InputProfile, DetectedDevice } from '@shared/types/controls';
import { findPresetById } from '@shared/input';
import { getInputManager } from '../../../../../lib/input/input-manager';
import { padHex } from './types';

interface UseDragDropArgs {
  devices: DetectedDevice[];
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
}

const useDragDrop = ({ devices, activeProfile, updateActiveProfile }: UseDragDropArgs) => {
  const [dragOverBindings, setDragOverBindings] = useState(false);
  const [confirmPreset, setConfirmPreset] = useState<{ presetId: string; deviceName: string; vid: string; pid: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-preset-id')) {
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

    const presetId = e.dataTransfer.getData('application/x-preset-id');
    const deviceId = e.dataTransfer.getData('application/x-device-id');
    const vid = e.dataTransfer.getData('application/x-vid');
    const pid = e.dataTransfer.getData('application/x-pid');
    if (!presetId) return;

    const device = devices.find(d => d.id === deviceId);
    setConfirmPreset({
      presetId,
      deviceName: device?.displayName ?? 'Unknown Device',
      vid: vid || device?.vendorId || '',
      pid: pid || device?.productId || '',
    });
  }, [devices]);

  // ─── Apply preset ───
  const handleApplyPreset = useCallback(() => {
    if (!confirmPreset || !activeProfile) return;

    const preset = findPresetById(confirmPreset.presetId);
    if (!preset) {
      setConfirmPreset(null);
      return;
    }

    const vid = confirmPreset.vid ? padHex(confirmPreset.vid) : '';
    const pid = confirmPreset.pid ? padHex(confirmPreset.pid) : '';

    const mappingsWithSource = preset.defaultMappings.map(m => ({
      ...m,
      icon: m.binding.type === 'gamepad-axis' ? m.icon : null,
      sourceVid: m.binding.type !== 'keyboard' ? vid : null,
      sourcePid: m.binding.type !== 'keyboard' ? pid : null,
    }));

    const updatedProfile: InputProfile = {
      ...activeProfile,
      name: preset.name,
      deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
      deviceFamily: preset.family,
      mappings: mappingsWithSource,
      assignedDevice: preset.family !== 'keyboard' ? {
        vendorId: vid,
        productId: pid,
        displayName: confirmPreset.deviceName,
        deviceFamily: preset.family,
        presetId: preset.id,
      } : null,
      modifiedAt: Date.now(),
    };

    updateActiveProfile(updatedProfile);
    setConfirmPreset(null);
  }, [confirmPreset, activeProfile, updateActiveProfile]);

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
