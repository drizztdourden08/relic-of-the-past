/* @layer shared-game @kind barrel */
export { ENGINE_SAMPLES, NUMBER_KEY, PLAYER_NAME_KEY } from './builtin';
export { findHardcoded } from './find-hardcoded';
export { legacyFromVariables } from './legacy-from-variables';
export { variablesFromNameTables } from './variables-from-name-tables';
export { mergeVariableMeta } from './merge-meta';
export { resolve } from './resolve';
export type {
  Occurrence,
  Variable,
  VariableIndex,
  VariableKind,
} from './types';
export { buildVariableIndex } from './variable-index';
