/* @layer shared-game @kind barrel */
export { buildGroups } from './group-index';
export { GROUP_TITLES } from './text.constants';
export { pauseNameSlots } from './catalog/pause-names';
export { worldNameSlots } from './catalog/world-names';
export { slotsFromDecoded } from './catalog/from-decoded';
export type {
  BuildGroupsParams, DecodedLine, DecodedSlotOptions, NamedKind, NamedRecord, RecordSource, TextGroup, TextGroupId,
  TextLimit, TextOverrides, TextSlot,
} from './types';
