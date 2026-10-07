/* @layer shared-input @kind barrel */
export { DEFAULT_AXIS_THRESHOLD, DEFAULT_TRIGGER_THRESHOLD, isBindingDown } from './binding-pressed';
export type { GamepadSample, InputSample } from './binding-pressed';
export { corePositions, positionOfBinding } from './core-positions';
export type { SdlPosition } from './core-positions';
export {
  DEFAULT_CORE_POSITIONS,
  KEYBOARD_CORE_SOURCE,
  defaultCoreBindings,
  defaultModernBindings,
  keyboardModernBindings,
} from './default-modern-bindings';
export type { CoreVerb } from './default-modern-bindings';
export { defaultSlotList, deviceSlots } from './derive-slots';
export { PREFILL_ORDER, inPrefillOrder, isLegacySlotList } from './prefill-order';
export { effectiveModernBindings, effectiveSlots } from './effective-slots';
export type { SlotSource } from './effective-slots';
export {
  FIRST_SLOT, addSlot, remapAssignments, removeSlot, renumberSlots, setSlotBinding, slotName,
} from './slot-list';
export type { NewSlot, SlotListEdit } from './slot-list';
export { SlotMigrationError, migrateScheme, migrateSlotList } from './migrate-slots';
export type { MigratedScheme } from './migrate-slots';
export { DIRECTION_BIT, emptyFunctionMask, readFunctionMask } from './function-mask';
export type { FunctionMask, MenuMask } from './function-mask';
export { menuEdges } from './menu-edges';
export type { MoveDirection } from './menu-edges';
export { menuShadowedSlots } from './menu-shadowed-slots';
export { remapClassic } from './remap-classic';
export type { ClassicOptions } from './remap-classic';
export { remapForScheme } from './remap-for-scheme';
export type { RemapRequest, RemapStrategy } from './remap-for-scheme';
export { remapModern } from './remap-modern';
export type { OwnsItem } from './remap-modern';
export type { ControlSchemeId, RemapResult } from './remap.type';
