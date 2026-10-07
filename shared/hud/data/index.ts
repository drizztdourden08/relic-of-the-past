/* @layer shared-hud @kind barrel */
export {
  HUD_SCOPE_EXTRAS, HUD_VARIABLES, hudDataScope, hudVariableNamesFor, isHudScopeExtra, isHudVariableName,
  suggestVariableName,
} from './variables';
export type { HudCountdownSource, HudScopeExtra, HudVariableDef, HudVitalsSource } from './variables';
export { compileExpr, compileExprCacheSize, MAX_EXPR_LENGTH, REFUSED_FUNCTIONS } from './compile-expr';
export type { CompiledExpr, CompileError, CompileOk, CompileResult } from './compile-expr';
export { clampFinite, MAX_SAFE_RESULT, resolveValue } from './resolve-value';
export { MAX_EXPANDED_NODES, MAX_REPEAT_COUNT } from './expand-limits';
