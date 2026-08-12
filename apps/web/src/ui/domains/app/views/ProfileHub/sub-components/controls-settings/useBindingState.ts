/* @layer renderer-components @kind hook */
/**
 * useBindingState — rebind listening, capture, and clear logic for
 * SNES button mappings and function-action mappings.
 */

import { useState, useCallback, useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type {
  InputProfile,
  InputBinding,
  SnesButton,
  FunctionAction,
  FunctionMapping,
  DetectedDevice,
} from '@shared/types/controls';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { resolveFunctionMappingIcon } from '../../../../../../../lib/input/input-manager';
import { allowedDevices } from '@app/lib/input/profile-devices';
import { resolveLiveFamilyIcon } from './family-icon-map';
import { padHex } from './controls-settings.type';

interface UseBindingStateArgs {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
  devices: DetectedDevice[];
}

const useBindingState = ({ settings, onChange, activeProfile, updateActiveProfile, devices }: UseBindingStateArgs) => {
  const [listeningFor, setListeningFor] = useState<
    | { type: 'snes'; button: SnesButton }
    | { type: 'function'; action: FunctionAction }
    | null
  >(null);

  // ─── Function mappings resolution ───
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
      const liveDevice = vid && pid
        ? devices.find(d => d.type === 'gamepad' && d.connected && d.vendorId && d.productId &&
            padHex(d.vendorId) === vid && padHex(d.productId) === pid)
        : undefined;
      const icon = resolveFunctionMappingIcon(m, liveDevice?.sdlType);
      const deviceIconUrl = multiController && vid && pid ? resolveLiveFamilyIcon({ vid, pid, devices }) : null;
      return { ...(icon ? { ...m, icon } : m), deviceIconUrl };
    });
  }, [functionMappings, devices, multiController]);

  // ─── Rebind handlers ───
  const handleSnesRebind = useCallback((snesButton: SnesButton) => {
    setListeningFor({ type: 'snes', button: snesButton });
  }, []);

  const handleFunctionRebind = useCallback((action: FunctionAction) => {
    setListeningFor({ type: 'function', action });
  }, []);

  // ─── Clear a SNES button binding ───
  const handleSnesClear = useCallback((snesButton: SnesButton) => {
    if (!activeProfile) return;
    const updatedMappings = activeProfile.mappings.map(m => {
      if (m.snesButton !== snesButton) return m;
      return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
    });
    const updatedProfile: InputProfile = { ...activeProfile, mappings: updatedMappings, modifiedAt: Date.now() };
    updateActiveProfile(updatedProfile);
  }, [activeProfile, updateActiveProfile]);

  // ─── Clear a function action binding ───
  const handleFunctionClear = useCallback((action: FunctionAction) => {
    const updatedFn = functionMappings.map(m => {
      if (m.action !== action) return m;
      return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
    });
    onChange({ functionMappings: updatedFn });
  }, [functionMappings, onChange]);

  // ─── Handle captured input ───
  const handleCapture = useCallback((binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => {
    if (!listeningFor) return;
    setListeningFor(null);

    const vid = vendorId ? padHex(vendorId) : null;
    const pid = productId ? padHex(productId) : null;

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
  }, [listeningFor, activeProfile, updateActiveProfile, functionMappings, onChange]);

  return {
    listeningFor,
    functionMappings,
    displayFunctionMappings,
    setListeningFor,
    handleSnesRebind,
    handleFunctionRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
  };
};

export { useBindingState };
