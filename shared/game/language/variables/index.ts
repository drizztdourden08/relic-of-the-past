/* @layer shared-game @kind barrel */
export { builtinVariables, ENGINE_SAMPLES, isBuiltinKey, NUMBER_KEY, PLAYER_NAME_KEY } from './builtin';
export { findHardcoded } from './find-hardcoded';
export type { Occurrence } from './find-hardcoded';
export { legacyFromVariables, variablesFromLegacy } from './from-legacy';
export type { LegacyNameData } from './from-legacy';
export { hardcodedCandidates } from './hardcoded-candidates';
export type { Candidate } from './hardcoded-candidates';
export { mergeVariableMeta } from './merge-meta';
export { resolve } from './resolve';
export type { ResolveMode, ResolveOptions } from './resolve';
export { isSearchablePhrase, MIN_PHRASE_LENGTH, scanRun } from './scan-run';
export type { RunScan } from './scan-run';
export type { Variable, VariableIndex, VariableKind } from './types';
export { buildVariableIndex } from './variable-index';
