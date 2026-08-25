/* @layer shared-game @kind barrel */
export { buildGroups, GROUP_TITLES } from './group-index';
export type { BuildGroupsParams } from './group-index';
export { pauseNameSlots } from './catalog/pause-names';
export { worldNameSlots } from './catalog/world-names';
export type { NamedKind, NamedRecord, RecordSource } from './catalog/world-names';
export { slotsFromDecoded } from './catalog/from-decoded';
export type { DecodedLine, DecodedSlotOptions } from './catalog/from-decoded';
export type { TextGroup, TextGroupId, TextLimit, TextOverrides, TextSlot } from './types';
