/* @layer renderer-components @kind logic */
import { capacityEnabledOf, includeNpcChecksOf, includeWorldItemsOf, shopScopeOfValues } from '@rotp/randomizer';
import type { ScopeFlag, SnapshotValues } from './options-summary.type';

const scopeFlagsOf = (values: SnapshotValues, seed: string): readonly ScopeFlag[] => [
  { id: 'npc', label: 'NPC gifts', on: includeNpcChecksOf(values) },
  { id: 'world', label: 'World items', on: includeWorldItemsOf(values) },
  { id: 'key-drops', label: 'Key drops', on: values.key_drop_shuffle === true },
  { id: 'prizes', label: 'Dungeon prizes', on: values.dungeon_prize_shuffle === true },
  { id: 'shops', label: 'Shops', on: shopScopeOfValues(values, seed).mode !== 'vanilla' },
  { id: 'capacity', label: 'Capacity upgrades', on: capacityEnabledOf(values) },
];

export { scopeFlagsOf };
