/* @layer shared-game @kind logic */
import { TRUE } from '../rule-node-build';
import { ruleOptionsOfWorld } from '../rule-options';
import type { LocationKey } from '../../location-key.type';
import type { World } from '../../world.type';
import type { RuleNode } from '../rule-node.type';
import type { EventRuleView, ExitRuleView, WorldRulesView } from '../rules.type';

const ruleNodesOfWorld = (world: World): WorldRulesView => {
  const locations: Record<LocationKey, RuleNode> = {};
  for (const key of world.locationsByKey.keys()) locations[key] = world.getLocationRule(key)?.node ?? TRUE;
  const exits: ExitRuleView[] = [];
  for (const region of world.regions.values()) {
    for (const exit of region.exits) {
      exits.push({ name: exit.name, from: exit.source, to: exit.target, node: world.getRule(exit.name)?.node ?? TRUE });
    }
  }
  const events = [...world.eventsByKey.values()].map((event): EventRuleView => ({
    key: event.key, region: event.region, node: world.getEventRule(event.key)?.node ?? TRUE,
  }));
  return { locations, exits, events, options: ruleOptionsOfWorld(world) };
};

export { ruleNodesOfWorld };
