/* @layer shared-game @kind types */
import type { WorldKeys } from '@drizztdourden08/brock-randomizer/world';
import type { CheckId, RegionId } from '@rotp/game-data';
import type { ItemKey } from './item-ids';
import type { LocationKey } from './location-key.type';
import type { Holding } from './collection-state.type';
import type { HelperName, RuleOptionKey } from './rules/rule-node.type';

interface RotpKeys extends WorldKeys {
  item: ItemKey;
  location: LocationKey;
  region: RegionId;
  event: CheckId;
  holding: Holding;
  helper: HelperName;
  option: RuleOptionKey;
}

export type { RotpKeys };
