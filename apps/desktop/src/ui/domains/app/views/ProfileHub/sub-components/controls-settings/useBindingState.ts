/* @layer renderer-components @kind hook */
import { useState, useCallback, useMemo } from 'react';
import type { CoreVerb } from '@shared/input/scheme';
import type { InputProfile } from '@shared/types/controls/devices/devices.type';
import type { InputBinding, ModernSlot, SnesButton } from '@rotp/game-data';
import type { FunctionAction, FunctionMapping } from '@rotp/features';
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import { resolveFunctionMappingIcon } from '../../../../../../../lib/input/input-manager';
import { allowedDevices } from '@app/lib/input/profile-devices';
import { resolveLiveFamilyIcon } from './family-icon-map';
import { findLiveDevice } from './live-device';
import { padHex } from './pad-hex';
import type { ListeningTarget, UseBindingStateArgs } from './controls-settings.type';

const useBindingState = (args: UseBindingStateArgs) => {
  const { settings, onChange, activeProfile, updateActiveProfile, devices, applyCoreBinding, applySlotBinding } = args;
  const [listeningFor, setListeningFor] = useState<ListeningTarget | null>(null);

  const functionMappings: FunctionMapping[] = useMemo(() => {
    if (settings.functionMappings && settings.functionMappings.length > 0) {
      const existing = new Set(settings.functionMappings.map(m => m.action));
      const merged = [...settings.functionMappings];
      for (const def of DEFAULT_FUNCTION_MAPPINGS) {
        if (!existing.has(def.action)) merged.push(def);
      }
      return merged;
    }
    return DEFAULT_FUNCTION_MAPPINGS;
  }, [settings.functionMappings]);

  const multiController = useMemo(() => allowedDevices(activeProfile).gamepadKeys.size > 1, [activeProfile]);

  const displayFunctionMappings: Array<FunctionMapping & { deviceIconUrl?: string | null }> = useMemo(() => {
    return functionMappings.map(m => {
      const vid = m.sourceVid ? padHex(m.sourceVid) : null;
      const pid = m.sourcePid ? padHex(m.sourcePid) : null;
      const liveDevice = vid && pid ? findLiveDevice(vid, pid, devices) : undefined;
      const icon = resolveFunctionMappingIcon(m, liveDevice?.sdlType);
      const deviceIconUrl = multiController && vid && pid ? resolveLiveFamilyIcon({ vid, pid, devices }) : null;
      return { ...(icon ? { ...m, icon } : m), deviceIconUrl };
    });
  }, [functionMappings, devices, multiController]);

  const handleSnesRebind = useCallback((snesButton: SnesButton) => {
    setListeningFor({ type: 'snes', button: snesButton });
  }, []);

  const handleFunctionRebind = useCallback((action: FunctionAction) => {
    setListeningFor({ type: 'function', action });
  }, []);

  const handleCoreRebind = useCallback((verb: CoreVerb) => {
    setListeningFor({ type: 'core', verb });
  }, []);

  const handleSlotRebind = useCallback((slot: ModernSlot) => {
    setListeningFor({ type: 'slot', slot });
  }, []);

  const handleSnesClear = useCallback((snesButton: SnesButton) => {
    if (!activeProfile) return;
    const updatedMappings = activeProfile.mappings.map(m => {
      if (m.snesButton !== snesButton) return m;
      return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
    });
    const updatedProfile: InputProfile = { ...activeProfile, mappings: updatedMappings, modifiedAt: Date.now() };
    updateActiveProfile(updatedProfile);
  }, [activeProfile, updateActiveProfile]);

  const handleFunctionClear = useCallback((action: FunctionAction) => {
    const updatedFn = functionMappings.map(m => {
      if (m.action !== action) return m;
      return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
    });
    onChange({ functionMappings: updatedFn });
  }, [functionMappings, onChange]);

  const handleCapture = useCallback((binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => {
    if (!listeningFor) return;
    setListeningFor(null);

    const vid = vendorId ? padHex(vendorId) : null;
    const pid = productId ? padHex(productId) : null;

    if (listeningFor.type === 'core') {
      applyCoreBinding(listeningFor.verb, binding);
      return;
    }

    if (listeningFor.type === 'slot') {
      applySlotBinding(listeningFor.slot, binding);
      return;
    }

    if (listeningFor.type === 'snes') {
      if (!activeProfile) return;
      const updatedMappings = activeProfile.mappings.map(m => {
        if (m.snesButton !== listeningFor.button) return m;
        return {
          ...m,
          binding,
          icon: null,
          sourceVid: binding.type !== 'keyboard' ? vid : null,
          sourcePid: binding.type !== 'keyboard' ? pid : null,
        };
      });

      const updatedProfile: InputProfile = {
        ...activeProfile,
        mappings: updatedMappings,
        modifiedAt: Date.now(),
      };
      updateActiveProfile(updatedProfile);
    } else {
      const updatedFn = functionMappings.map(m => {
        if (m.action === listeningFor.action) {
          return {
            ...m,
            binding,
            icon: null,
            sourceVid: binding.type !== 'keyboard' ? vid : null,
            sourcePid: binding.type !== 'keyboard' ? pid : null,
          };
        }
        if (binding.type === 'gamepad-button' && m.binding.type === 'gamepad-button' && m.binding.index === binding.index) {
          return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
        }
        if (binding.type === 'gamepad-axis' && m.binding.type === 'gamepad-axis' &&
            m.binding.axisIndex === binding.axisIndex && m.binding.direction === binding.direction) {
          return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
        }
        return m;
      });
      onChange({ functionMappings: updatedFn });
    }
  }, [listeningFor, activeProfile, updateActiveProfile, functionMappings, onChange, applyCoreBinding, applySlotBinding]);

  return {
    listeningFor,
    functionMappings,
    displayFunctionMappings,
    setListeningFor,
    handleSnesRebind,
    handleFunctionRebind,
    handleCoreRebind,
    handleSlotRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
  };
};

export { useBindingState };
export type { ListeningTarget };
