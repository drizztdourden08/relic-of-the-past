/* @layer shared-game @kind logic */
import { getCheck } from '@rotp/game-data';
import { TAKEN_NAMES } from './export-regions.constants';
import { REGION } from '../../world/region-ids.constants';
import { ruleNodesOfWorld } from '../../world/rules/world-rules-view';
import type { World } from '../../world/world.type';
import type { ExportedEvent, ExportedRegions } from './export.type';

const exportRegions = (world: World): ExportedRegions => {
  const view = ruleNodesOfWorld(world);
  const events = view.events.map((event): ExportedEvent => {
    const { name } = getCheck(event.key);
    if (TAKEN_NAMES.has(name)) throw new Error(`story event shares a name with a location or item: ${name}`);
    return { key: event.key, name, region: event.region, rule: event.node };
  });
  return {
    start: REGION.start,
    regions: [...world.regions.values()].map((region) => ({ id: region.id, name: region.name })),
    exits: view.exits.map((exit) => ({ name: exit.name, from: exit.from, to: exit.to, rule: exit.node })),
    events,
  };
};

export { exportRegions };
