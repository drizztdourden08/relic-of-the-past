/* @layer shared-game @kind logic */
import { AP_GAME, AP_WORLD_VERSION } from '../ap-game';
import { GOAL_EVENT } from '../../world/events';
import { widestRuledWorld } from './widest-ruled-world';
import { exportLocations } from './export-locations';
import { exportRegions } from './export-regions';
import { exportItems } from './export-items';
import { exportRules } from './export-rules';
import { exportOptions } from './export-options';
import type { WorldExport } from './export.type';

const exportWorld = (): WorldExport => {
  const world = widestRuledWorld();
  return {
    'game.json': { game: AP_GAME, worldVersion: AP_WORLD_VERSION, goalEvent: GOAL_EVENT },
    'locations.json': exportLocations(world),
    'regions.json': exportRegions(world),
    'items.json': exportItems(),
    'rules.json': exportRules(world),
    'options.json': exportOptions(),
  };
};

export { exportWorld };
