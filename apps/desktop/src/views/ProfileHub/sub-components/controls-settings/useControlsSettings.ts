/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { UseControlsSettingsArgs } from './controls-settings.type';
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
import { useControlsTabs } from './useControlsTabs';

const useControlsSettings = ({ settings, onChange, profileId }: UseControlsSettingsArgs) => {
  const profileActions = useProfileActions({ settings, onChange, profileId });
  const { activeProfile, updateActiveProfile } = profileActions;
  const deviceSync = useDeviceSync();
  const { devices, entries } = deviceSync;

  const controls = useMemo(() => controlsForProfile(activeProfile, entries), [activeProfile, entries]);

  const modernScheme = useModernScheme({ settings, onChange, activeProfile, updateActiveProfile, controls });
  const { scheme, coreBindings, applyCoreBinding, applySlotBinding } = modernScheme;

  const bindingState = useBindingState({ settings, onChange, activeProfile, updateActiveProfile, devices, applyCoreBinding, applySlotBinding });
  const dragDrop = useDragDrop({ devices, entries, scheme, activeProfile, updateActiveProfile });
  const displayMappings = useDisplayMappings({ activeProfile, devices });
  const schemeLayout = useSchemeLayout({ activeProfile, updateActiveProfile });
  const coreIcons = useCoreIcons({ activeProfile, devices, core: coreBindings });
  const haptics = useHapticsToggle({ settings, onChange });
  const tabs = useControlsTabs(scheme);

  return {
    ...profileActions,
    ...deviceSync,
    ...modernScheme,
    ...bindingState,
    ...dragDrop,
    ...displayMappings,
    ...schemeLayout,
    ...haptics,
    ...tabs,
    coreIcons,
  };
};

export { useControlsSettings };
