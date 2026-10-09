/* @layer shared-game @kind barrel */
export { applyEnter } from './apply-enter';
export { breakLine } from './break-line';
export { continueByScrolling } from './continue-by-scrolling';
export { endBlockAt } from './end-block-at';
export { locateCaret } from './locate';
export { policyFor } from './modes';
export { reflow } from './reflow';
export { STRUCTURE_MODES } from './structure.constants';
export type {
  Caret, CaretSite, LineBreak, StructureContext, StructureMode, StructurePolicy,
} from './types';
