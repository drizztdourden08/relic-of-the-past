/* @layer renderer-components @kind hook */
/**
 * Thin orchestrator composing focused sub-hooks.
 *
 * Order matters in one place only: the resolved control list for the active
 * profile's device feeds both the scheme hook (which owns the slot list) and
 * the drag/drop hook (which builds a dropped device's modern bindings), so it
 * is computed once here instead of twice below.
 */

import { useEffect, useMemo, useState } from 'react';
import type { UseControlsSettingsArgs } from './controls-settings.type';
import { controlsForProfile } from './profile-controls';
import { useProfileActions } from './useProfileActions';
import { useDeviceSync } from './useDeviceSync';
import { useModernScheme } from './useModernScheme';
import { useSchemeLayout } from './useSchemeLayout';
import { useBindingState } from './useBindingState';
import { useDragDrop } from './useDragDrop';
import { useDisplayMappings } from './useDisplayMappings';
import { useCoreIcons } from './useCoreIcons';
import { useHapticsToggle } from './useHapticsToggle';

type ControlsTab = 'controls' | 'modern' | 'shortcuts' | 'cheats';

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

  // The HUD layout is a property of the SCHEME, so it is edited here beside the
  // slot list instead of in the HUD settings. Switching control profile then
  // switches the arrangement with the buttons.
  const schemeLayout = useSchemeLayout({ activeProfile, updateActiveProfile });

  // Both binding tabs draw the core verbs, so the glyph for each one is
  // resolved here instead of inside either tab (see useCoreIcons).
  const coreIcons = useCoreIcons({ activeProfile, devices, core: coreBindings });

  const { hapticsEnabled, setHapticsEnabled } = useHapticsToggle({ settings, onChange });

  // Each scheme greys out the other's binding tab, so a HUD-style change (which
  // is what moves the scheme now) while that tab is open moves to its
  // counterpart instead of leaving the screen parked on a disabled tab.
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
