/* @layer shared-game @kind logic */
/** Public surface of the pause-menu logic: cells, ladders, screens, reducer. */
export {
  BOTTLE_COUNT,
  FIRST_BOTTLE_HUD_ITEM,
  INSTRUMENT_HUD_ITEM,
  ITEM_CELL_COUNT,
  ITEM_SLOT_COUNT,
  TOOL_HUD_ITEM,
  buildItemCells,
  hudItemAt,
} from './item-cells';
export type { ItemCell, PauseNameKey } from './item-cells';

export {
  ARROW_LADDER,
  GEAR_KINDS,
  GEAR_LADDER_KINDS,
  NO_ARROW_TYPE,
  arrowTypeOf,
  clampGearTier,
  gearTierCells,
  gearTierCount,
  isGearTierSelectable,
  maxGearTier,
} from './gear-tiers';
export type { GearKind, GearLadderKind, GearTierCell } from './gear-tiers';

export {
  ACTION_COUNT,
  ITEM_COLUMNS,
  PASSIVE_COUNT,
  SCREEN_ORDER,
  SCREEN_SECTIONS,
  clampCursor,
  firstSectionOf,
  moveCursor,
  sectionsOf,
  stepScreen,
} from './screens';
export type { CursorPos, RowSegment } from './screens';

export { planAssignment } from './assign-rule';
export type { AssignPlan } from './assign-rule';

export { confirmTargetAt, confirmVerbAt, planConfirm } from './confirm-rule';
export type { ConfirmPlan, ConfirmTarget, ConfirmVerb } from './confirm-rule';

export { assignTargetAt, reducePause } from './pause-machine';
export type {
  AssignTarget, PauseContext, PauseEvent, PauseScreen, PauseSection, PauseState,
} from './pause-machine';
