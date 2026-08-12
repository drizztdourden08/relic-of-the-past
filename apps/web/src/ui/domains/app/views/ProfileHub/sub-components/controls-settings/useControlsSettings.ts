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
import { useHapticsToggle } from './useHapticsToggle';

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

  const { devices, filteredDevices, controllerGroups, isRescanPending, handleRescan, addMapping } = useDeviceSync();

  const {
    listeningFor,
    displayFunctionMappings,
    setListeningFor,
    handleSnesRebind,
    handleFunctionRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
  } = useBindingState({ settings, onChange, activeProfile, updateActiveProfile, devices });

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

  const { hapticsEnabled, setHapticsEnabled } = useHapticsToggle({ settings, onChange });

  return {
    profiles,
    activeProfile,
    devices,
    filteredDevices,
    controllerGroups,
    isRescanPending,
    handleRescan,
    addMapping,
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
    hapticsEnabled,
    setHapticsEnabled,
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
