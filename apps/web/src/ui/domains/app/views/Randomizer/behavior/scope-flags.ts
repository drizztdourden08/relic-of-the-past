/* @layer renderer-components @kind logic */
/**
 * The shuffle scopes of a frozen snapshot: which parts of the world the run
 * put into the item pool. Each is read with the reader the generator uses,
 * so a scope reads on here exactly when the seed was rolled with it.
 */
import { capacityEnabledOf } from '@shared/randomizer/world/capacity';
import { includeNpcChecksOf, includeWorldItemsOf } from '@shared/randomizer/world/scope-option-keys';
import { shopScopeOfValues } from '@shared/randomizer/world/shops/shop-scope-from-values';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { ScopeFlag } from './options-summary.type';

type Values = Readonly<Record<string, OptionValue>>;

const scopeFlagsOf = (values: Values, seed: string): readonly ScopeFlag[] => [
  { id: 'npc', label: 'NPC gifts', on: includeNpcChecksOf(values) },
  { id: 'world', label: 'World items', on: includeWorldItemsOf(values) },
  { id: 'key-drops', label: 'Key drops', on: values.key_drop_shuffle === true },
  { id: 'prizes', label: 'Dungeon prizes', on: values.dungeon_prize_shuffle === true },
  { id: 'shops', label: 'Shops', on: shopScopeOfValues(values, seed).mode !== 'vanilla' },
  { id: 'capacity', label: 'Capacity upgrades', on: capacityEnabledOf(values) },
];

export { scopeFlagsOf };
