/* @layer shared-game @kind logic */
import { shopsShuffled } from './shops-shuffled';
import type { ShopScope } from '../../shops/shop-scope.type';
import type { RetroBowSetting } from '../retro.type';

const retroQuiverInPool = (scope: ShopScope | undefined, setting: RetroBowSetting | undefined): boolean =>
  setting?.enabled === true && scope !== undefined && shopsShuffled(scope);

export { retroQuiverInPool };
