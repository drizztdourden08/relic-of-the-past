/* @layer renderer-hud @kind barrel */
export { useHudNodeMotion } from './useHudNodeMotion';
// The HUD editor's motion transport reads the SAME signal the renderer does,
// instead of a second `matchMedia` call that could disagree with it.
export { useReducedMotion } from './useReducedMotion';
