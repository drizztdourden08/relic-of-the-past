/* @layer shared-hud @kind barrel */
export {
  HUD_SCOPE_EXTRAS, HUD_VARIABLES, hudDataScope, hudVariableNamesFor, isHudScopeExtra, isHudVariableName,
  suggestVariableName,
} from './variables';
export type { HudCountdownSource, HudVitalsSource } from './variables';
export { compileExpr, compileExprCacheSize, MAX_EXPR_LENGTH } from './compile-expr';
export { clampFinite, MAX_SAFE_RESULT, resolveValue } from './resolve-value';
