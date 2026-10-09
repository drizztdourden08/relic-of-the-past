/* @layer shared-game @kind barrel */
export { builtinVariables, ENGINE_SAMPLES, isBuiltinKey, NUMBER_KEY, PLAYER_NAME_KEY } from './builtin';
export { findHardcoded } from './find-hardcoded';
export { legacyFromVariables } from './legacy-from-variables';
export { variablesFromNameTables } from './variables-from-name-tables';
export { hardcodedCandidates } from './hardcoded-candidates';
export { mergeVariableMeta } from './merge-meta';
export { resolve } from './resolve';
export { isSearchablePhrase } from './is-searchable-phrase';
export { MIN_PHRASE_LENGTH } from './variables.constants';
export { scanRun } from './scan-run';
export type {
  Candidate, LegacyNameData, Occurrence, ResolveMode, ResolveOptions, RunScan, Variable, VariableIndex, VariableKind,
} from './types';
export { buildVariableIndex } from './variable-index';
