/* @layer shared-game @kind logic */
/**
 * A built world's rules as plain data: every location's tree, every passage's tree with its two
 * ends, every story event's tree with the region it happens in, and the setting readings the
 * trees test. Nothing here is compiled; it is the view an exporter serializes.
 *
 * A name no table ruled is registered open (rules/register.ts), so every location, event and exit
 * of a registered world has a tree; one missing here reads as `true`, the same as the engine
 * reads it.
 */
import { TRUE } from './rule-node-build';
import { ruleOptionsOfWorld } from './rule-options';
import type { CheckId, RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';
import type { RuleNode, RuleOptionKey, RuleOptionValue } from './rule-node.type';

interface ExitRuleView {
  name: string;
  from: RegionId;
  to: RegionId;
  node: RuleNode;
}

interface EventRuleView {
  key: CheckId;
  region: RegionId;
  node: RuleNode;
}

interface WorldRulesView {
  locations: Record<LocationKey, RuleNode>;
  exits: ExitRuleView[];
  events: EventRuleView[];
  options: Record<RuleOptionKey, RuleOptionValue>;
}

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
export type { EventRuleView, ExitRuleView, WorldRulesView };
