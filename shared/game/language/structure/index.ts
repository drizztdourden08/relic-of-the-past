/* @layer shared-game @kind barrel */
export { applyEnter } from './apply-enter';
export { breakLine } from './break-line';
export type { LineBreak } from './break-line';
export { continueByScrolling, endBlockAt } from './block-actions';
export { locateCaret } from './locate';
export type { CaretSite } from './locate';
export { policyFor, STRUCTURE_MODES } from './modes';
export type { StructureMode, StructurePolicy } from './modes';
export { reflow } from './reflow';
export type { Caret, StructureContext } from './types';
