/* @layer shared-game @kind logic */
/**
 * The world package's data, file by file: the widest world's locations, regions and rule trees,
 * every item, the derived helpers, and the option catalog. Nothing here belongs to one profile;
 * what one profile settles travels in its player file (pre-rolled.ts).
 */
import { AP_GAME, AP_WORLD_VERSION } from '../ap-game';
import { VICTORY_ITEM } from '../../world/pool/event-items.data';
import { widestRuledWorld } from './widest-world';
import { exportLocations } from './export-locations';
import { exportRegions } from './export-regions';
import { exportItems } from './export-items';
import { exportRules } from './export-rules';
import { exportOptions } from './export-options';

type WorldExport = Record<string, unknown>;

/** File name to its content, for the build to write as JSON. */
const exportWorld = (): WorldExport => {
  const world = widestRuledWorld();
  return {
    'game.json': { game: AP_GAME, worldVersion: AP_WORLD_VERSION, victoryItem: VICTORY_ITEM },
    'locations.json': exportLocations(world),
    'regions.json': exportRegions(world),
    'items.json': exportItems(),
    'rules.json': exportRules(world),
    'options.json': exportOptions(),
  };
};

export { exportWorld };
export type { WorldExport };
