/* @layer shared-game @kind logic */
/**
 * regions.json: the start region, every region by id and name, every passage with its two ends
 * and its rule tree, and every story event of the world with its name, its region and its rule
 * tree. A region's id is its name to Archipelago, because display names repeat.
 *
 * An event is named after its own record, the story moment ("Agahnim 1 beaten"), and the loader
 * gives the Archipelago event location and event item it creates that one name. A name a real
 * location or item already carries is a porting error and throws.
 */
import { getCheck } from '@shared/game/data';
import { AP_ITEM_NAMES, AP_LOCATION_NAMES } from '../ap-ids.data';
import { REGION } from '../../world/region-ids.data';
import { ruleNodesOfWorld } from '../../world/rules/world-rules-view';
import type { World } from '../../world/world.type';
import type { ExportedEvent, ExportedRegions } from './export.type';

const TAKEN_NAMES: ReadonlySet<string> = new Set([...Object.values(AP_LOCATION_NAMES), ...Object.values(AP_ITEM_NAMES)]);

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
