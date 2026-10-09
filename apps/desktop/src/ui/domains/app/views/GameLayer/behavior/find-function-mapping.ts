/* @layer renderer-components @kind logic */
import type { FunctionAction, FunctionMapping } from '@shared/types/controls/functions/functions.type';

const findFunctionMapping = (mappings: FunctionMapping[], action: FunctionAction): FunctionMapping | null =>
  mappings.find(m => m.action === action && m.binding.type !== 'none') ?? null;

export { findFunctionMapping };
