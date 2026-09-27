/* @layer shared-game @kind logic */
/**
 * regions.json: the start region, every region by id and name, every passage with its two ends
 * and its rule tree, and each event location with the event item it hands over. A region's id
 * is its name to Archipelago, because display names repeat.
 */
import { REGION } from '../../world/region-ids.data';
import { ruleNodesOfWorld } from '../../world/rules/world-rules-view';
import type { World } from '../../world/world.type';
import type { ExportedRegions } from './export.type';

const exportRegions = (world: World): ExportedRegions => {
  const view = ruleNodesOfWorld(world);
  return {
    start: REGION.start,
    regions: [...world.regions.values()].map((region) => ({ id: region.id, name: region.name })),
    exits: view.exits.map((exit) => ({ name: exit.name, from: exit.from, to: exit.to, rule: exit.node })),
    events: view.events.map((event) => ({ location: event.location, item: event.item })),
  };
};

export { exportRegions };
