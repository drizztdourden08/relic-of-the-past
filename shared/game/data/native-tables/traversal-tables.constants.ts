/* @layer shared-game @kind constants */
import type { DoorKind } from '../types/native-tables';
import type { ConnectionTag } from '../taxonomy/connection-tags';
import type { ItemId } from '../types/ids';
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import { NO_BARRIERS } from './native-table-fallbacks.constants';
import { pickNativeTable } from './pick-native-table';

const ITEM_TO_TOKEN = pickNativeTable<Partial<Record<ItemId, TraversalRequirement>>>('ITEM_TO_TOKEN', {});
const IMPLIED_TOKENS = pickNativeTable<Partial<Record<TraversalRequirement, readonly TraversalRequirement[]>>>('IMPLIED_TOKENS', {});
const BARRIER_TO_TOKEN = pickNativeTable<Partial<Record<ConnectionTag, TraversalRequirement>>>('BARRIER_TO_TOKEN', {});
const DOOR_BARRIER = pickNativeTable<Record<DoorKind, string | null>>('DOOR_BARRIER', NO_BARRIERS);

export { BARRIER_TO_TOKEN, DOOR_BARRIER, IMPLIED_TOKENS, ITEM_TO_TOKEN };
