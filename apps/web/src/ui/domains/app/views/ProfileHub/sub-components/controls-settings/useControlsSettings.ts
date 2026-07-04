/* @layer renderer-components @kind hook */
/**
 * useControlsSettings — thin orchestrator composing focused sub-hooks.
 */

import { useState } from 'react';
import type { UseControlsSettingsArgs } from './controls-settings.type';
import { useProfileActions } from './useProfileActions';
import { useDeviceSync } from './useDeviceSync';
import { useBindingState } from './useBindingState';
import { useDragDrop } from './useDragDrop';
import { useDisplayMappings } from './useDisplayMappings';
import { useHapticDevices } from './useHapticDevices';

const useControlsSettings = ({ settings, onChange, profileId }: UseControlsSettingsArgs) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'enhanced' | 'shortcuts' | 'cheats'>('controls');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [devicesCollapsed, setDevicesCollapsed] = useState(false);

  const {
    profiles,
    activeProfile,
    deleteTarget,
    newlyCreatedId,
    setDeleteTarget,
    selectProfile,
    updateActiveProfile,
    handleCreate,
    handleRename,
    handleDeleteConfirm,
  } = useProfileActions({ settings, onChange, profileId });

  const { devices, filteredDevices } = useDeviceSync();

  const {
    listeningFor,
    displayFunctionMappings,
    setListeningFor,
    handleSnesRebind,
    handleFunctionRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
  } = useBindingState({ settings, onChange, activeProfile, updateActiveProfile });

  const {
    dragOverBindings,
    confirmPreset,
    setConfirmPreset,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleApplyPreset,
  } = useDragDrop({ devices, activeProfile, updateActiveProfile });

  const { requiredInputs, displayMappings } = useDisplayMappings({ activeProfile, devices });

  const {
    hapticEnabledDevices,
    hapticDragOver,
    handleHapticDragOver,
    handleHapticDragLeave,
    handleHapticDrop,
    disableHaptics,
  } = useHapticDevices({ settings, onChange, devices });

  return {
    profiles,
    activeProfile,
    devices,
    filteredDevices,
    listeningFor,
    dragOverBindings,
    deleteTarget,
    newlyCreatedId,
    confirmPreset,
    activeTab,
    sidebarCollapsed,
    devicesCollapsed,
    requiredInputs,
    displayMappings,
    displayFunctionMappings,
    hapticEnabledDevices,
    hapticDragOver,
    handleHapticDragOver,
    handleHapticDragLeave,
    handleHapticDrop,
    disableHaptics,
    setActiveTab,
    setSidebarCollapsed,
    setDevicesCollapsed,
    setListeningFor,
    setDeleteTarget,
    setConfirmPreset,
    selectProfile,
    handleCreate,
    handleRename,
    handleDeleteConfirm,
    handleSnesRebind,
    handleFunctionRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleApplyPreset,
  };
};

export { useControlsSettings };
