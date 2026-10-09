/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { ControlsTab, UseControlsSettingsArgs } from './controls-settings.type';
import { controlsForProfile } from './controls-for-profile';
import { useProfileActions } from './useProfileActions';
import { useDeviceSync } from './useDeviceSync';
import { useModernScheme } from './useModernScheme';
import { useSchemeLayout } from './useSchemeLayout';
import { useBindingState } from './useBindingState';
import { useDragDrop } from './useDragDrop';
import { useDisplayMappings } from './useDisplayMappings';
import { useCoreIcons } from './useCoreIcons';
import { useHapticsToggle } from './useHapticsToggle';

const useControlsSettings = ({ settings, onChange, profileId }: UseControlsSettingsArgs) => {
  const [activeTab, setActiveTab] = useState<ControlsTab>('controls');
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

  const { devices, filteredDevices, entries, controllerGroups, isRescanPending, handleRescan, addMapping } = useDeviceSync();

  const controls = useMemo(() => controlsForProfile(activeProfile, entries), [activeProfile, entries]);

  const {
    scheme,
    coreBindings,
    modernSlots,
    assignments,
    absentAssignments,
    hasSlotSource,
    applyCoreBinding,
    applySlotBinding,
    addModernSlot,
    removeModernSlot,
  } = useModernScheme({ settings, onChange, activeProfile, updateActiveProfile, controls });

  const {
    listeningFor,
    displayFunctionMappings,
    setListeningFor,
    handleSnesRebind,
    handleFunctionRebind,
    handleCoreRebind,
    handleSlotRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
  } = useBindingState({ settings, onChange, activeProfile, updateActiveProfile, devices, applyCoreBinding, applySlotBinding });

  const {
    dragOverBindings,
    confirmPreset,
    setConfirmPreset,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleApplyPreset,
  } = useDragDrop({ devices, entries, scheme, activeProfile, updateActiveProfile });

  const { requiredInputs, displayMappings } = useDisplayMappings({ activeProfile, devices });

  const schemeLayout = useSchemeLayout({ activeProfile, updateActiveProfile });

  const coreIcons = useCoreIcons({ activeProfile, devices, core: coreBindings });

  const { hapticsEnabled, setHapticsEnabled } = useHapticsToggle({ settings, onChange });

  useEffect(() => {
    if (scheme === 'modern' && activeTab === 'controls') setActiveTab('modern');
    if (scheme === 'classic' && activeTab === 'modern') setActiveTab('controls');
  }, [scheme, activeTab]);

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
    scheme,
    coreBindings,
    coreIcons,
    modernSlots,
    assignments,
    absentAssignments,
    hasSlotSource,
    addModernSlot,
    removeModernSlot,
    layoutId: schemeLayout.layoutId,
    layouts: schemeLayout.layouts,
    setLayoutId: schemeLayout.setLayoutId,
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
    handleCoreRebind,
    handleSlotRebind,
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
export type { ControlsTab };
