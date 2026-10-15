/* @layer renderer-components @kind hook */
import { useState, useCallback, useMemo } from 'react';
import type { InputBinding, SnesButton } from '@rotp/game-data';
import type { FunctionAction } from '@rotp/features';
import { bindFunctionAction } from './bind-function-action';
import { bindSnesButton } from './bind-snes-button';
import { NO_BINDING } from './controls-settings.constants';
import { mergeFunctionMappings } from './merge-function-mappings';
import { padHexOrNull } from './pad-hex-or-null';
import { useDisplayFunctionMappings } from './useDisplayFunctionMappings';
import { useRebindHandlers } from './useRebindHandlers';
import type { ListeningTarget, UseBindingStateArgs } from './controls-settings.type';

const useBindingState = (args: UseBindingStateArgs) => {
  const { settings, onChange, activeProfile, updateActiveProfile, devices, applyCoreBinding, applySlotBinding } = args;
  const [listeningFor, setListeningFor] = useState<ListeningTarget | null>(null);

  const functionMappings = useMemo(() => mergeFunctionMappings(settings.functionMappings), [settings.functionMappings]);
  const displayFunctionMappings = useDisplayFunctionMappings({ functionMappings, activeProfile, devices });
  const rebindHandlers = useRebindHandlers({ setListeningFor });

  const handleSnesClear = useCallback((button: SnesButton) => {
    if (!activeProfile) return;
    updateActiveProfile(bindSnesButton({ profile: activeProfile, button, binding: NO_BINDING, vid: null, pid: null }));
  }, [activeProfile, updateActiveProfile]);

  const handleFunctionClear = useCallback((action: FunctionAction) => {
    const mappings = bindFunctionAction({ mappings: functionMappings, action, binding: NO_BINDING, vid: null, pid: null });
    onChange({ functionMappings: mappings });
  }, [functionMappings, onChange]);

  const handleCapture = useCallback((binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => {
    if (!listeningFor) return;
    setListeningFor(null);
    const vid = padHexOrNull(vendorId);
    const pid = padHexOrNull(productId);

    switch (listeningFor.type) {
      case 'core':
        applyCoreBinding(listeningFor.verb, binding);
        return;
      case 'slot':
        applySlotBinding(listeningFor.slot, binding);
        return;
      case 'snes':
        if (activeProfile) updateActiveProfile(bindSnesButton({ profile: activeProfile, button: listeningFor.button, binding, vid, pid }));
        return;
      case 'function':
        onChange({ functionMappings: bindFunctionAction({ mappings: functionMappings, action: listeningFor.action, binding, vid, pid }) });
    }
  }, [listeningFor, activeProfile, updateActiveProfile, functionMappings, onChange, applyCoreBinding, applySlotBinding]);

  return {
    listeningFor,
    functionMappings,
    displayFunctionMappings,
    setListeningFor,
    ...rebindHandlers,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
  };
};

export { useBindingState };
