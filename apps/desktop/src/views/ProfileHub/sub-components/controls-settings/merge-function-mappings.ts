/* @layer renderer-components @kind logic */
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import type { FunctionMapping } from '@rotp/features';

const mergeFunctionMappings = (saved: readonly FunctionMapping[] | undefined): FunctionMapping[] => {
  if (!saved || saved.length === 0) return DEFAULT_FUNCTION_MAPPINGS;
  const existing = new Set(saved.map(m => m.action));
  const missing = DEFAULT_FUNCTION_MAPPINGS.filter(def => !existing.has(def.action));
  return [...saved, ...missing];
};

export { mergeFunctionMappings };
