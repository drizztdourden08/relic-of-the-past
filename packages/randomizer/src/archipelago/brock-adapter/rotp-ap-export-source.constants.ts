/* @layer shared-game @kind constants */
import { getCheck } from '@rotp/game-data';
import { AP_GAME, AP_WORLD_VERSION } from '../ap-game';
import { AP_ITEM_IDS, AP_ITEM_NAMES, AP_LOCATION_IDS, AP_LOCATION_NAMES } from '../ap-ids.constants';
import { widestRuledWorld } from '../export/widest-ruled-world';
import { GOAL_EVENT } from '../../world/events';
import { optionCatalog } from '../../world/options';
import { HELPER_REGISTRY } from '../../world/rules/helpers-registry/helper-registry.constants';
import { PRIMITIVE_HELPERS } from '../../world/rules/primitive-helpers.constants';
import { baselineItemClassOf } from './baseline-item-class-of';
import { isLocationPrize } from './is-location-prize';
import { locationRequiresOf } from './location-requires-of';
import type { ApExportSource } from '@drizztdourden08/brock-randomizer/archipelago';
import type { RotpKeys } from '../../world/rotp-keys.type';

const ROTP_AP_EXPORT_SOURCE: ApExportSource<RotpKeys> = {
  game: AP_GAME,
  worldVersion: AP_WORLD_VERSION,
  goalEvent: GOAL_EVENT,
  world: widestRuledWorld,
  helpers: HELPER_REGISTRY,
  primitives: PRIMITIVE_HELPERS,
  locationIds: AP_LOCATION_IDS,
  locationNames: AP_LOCATION_NAMES,
  itemIds: AP_ITEM_IDS,
  itemNames: AP_ITEM_NAMES,
  itemClass: baselineItemClassOf,
  isPrize: isLocationPrize,
  requires: locationRequiresOf,
  eventName: (key) => getCheck(key).name,
  options: optionCatalog,
};

export { ROTP_AP_EXPORT_SOURCE };
