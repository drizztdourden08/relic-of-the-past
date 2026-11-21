/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { capacityEnabledOf, includeNpcChecksOf, includeWorldItemsOf, shopScopeOfValues } from '@rotp/randomizer';
import type { ScopeFlag, SnapshotValues } from './options-summary.type';

const scopeFlagsOf = (values: SnapshotValues, seed: string): readonly ScopeFlag[] => [
  { id: 'npc', label: msg('views-randomizer:scope.npc'), on: includeNpcChecksOf(values) },
  { id: 'world', label: msg('views-randomizer:scope.world'), on: includeWorldItemsOf(values) },
  { id: 'key-drops', label: msg('views-randomizer:scope.keyDrops'), on: values.key_drop_shuffle === true },
  { id: 'prizes', label: msg('views-randomizer:scope.prizes'), on: values.dungeon_prize_shuffle === true },
  { id: 'shops', label: msg('views-randomizer:scope.shops'), on: shopScopeOfValues(values, seed).mode !== 'vanilla' },
  { id: 'capacity', label: msg('views-randomizer:scope.capacity'), on: capacityEnabledOf(values) },
];

export { scopeFlagsOf };
