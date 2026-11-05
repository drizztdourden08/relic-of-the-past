/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { GlobalBindingsStore } from '@drizztdourden08/brock-input/renderer';
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import type { UseControlsArgs } from './controls-settings.type';
import { toFunctionMapping } from './to-function-mapping';

const useGlobalBindings = ({ settings, onChange }: UseControlsArgs): GlobalBindingsStore => {
  const saved = settings.functionMappings;
  return useMemo(() => ({
    mappings: saved,
    defaults: DEFAULT_FUNCTION_MAPPINGS,
    onChange: (next) => onChange({ functionMappings: next.flatMap(toFunctionMapping) }),
  }), [saved, onChange]);
};

export { useGlobalBindings };
