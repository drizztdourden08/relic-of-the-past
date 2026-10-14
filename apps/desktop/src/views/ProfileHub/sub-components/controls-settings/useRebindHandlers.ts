/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { CoreVerb } from '@rotp/input-mapping';
import type { ModernSlot, SnesButton } from '@rotp/game-data';
import type { FunctionAction } from '@rotp/features';
import type { UseRebindHandlersArgs } from './controls-settings.type';

const useRebindHandlers = ({ setListeningFor }: UseRebindHandlersArgs) => {
  const handleSnesRebind = useCallback((button: SnesButton) => {
    setListeningFor({ type: 'snes', button });
  }, [setListeningFor]);

  const handleFunctionRebind = useCallback((action: FunctionAction) => {
    setListeningFor({ type: 'function', action });
  }, [setListeningFor]);

  const handleCoreRebind = useCallback((verb: CoreVerb) => {
    setListeningFor({ type: 'core', verb });
  }, [setListeningFor]);

  const handleSlotRebind = useCallback((slot: ModernSlot) => {
    setListeningFor({ type: 'slot', slot });
  }, [setListeningFor]);

  return { handleSnesRebind, handleFunctionRebind, handleCoreRebind, handleSlotRebind };
};

export { useRebindHandlers };
