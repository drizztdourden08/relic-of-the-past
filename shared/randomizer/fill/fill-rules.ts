/* @layer shared-game @kind logic */
/**
 * Fill-time rule resolution. The tracker's resolver excludes dungeon-kind
 * screens from its reachability graph (interior traversal is not wired into
 * the tracker yet), but the fill must reason about every check location. This
 * widens the resolved graph with the dungeon-crossing connection records and
 * re-applies the entrance gates that stay dormant in the tracker's graph
 * (its overlay is a no-op for edges the graph does not contain).
 */
import { all, find, getScreen, toScreenIdOf } from '@shared/game/data';
import type { CheckId, ItemId, Requirement } from '@shared/game/data';
import type { LogicConfig } from '@shared/game/types';
import type { ReachConnection } from '@shared/game/logic/eval';
import { getBlockingItems } from '@shared/game/logic/eval';
import type { ResolvedRules } from '@shared/game/logic/resolver';
import { resolveRules } from '@shared/game/logic/resolver';
import { hasCrystals, hasSword } from '@shared/game/data/requirements/helpers';

interface EntranceGate {
  from: string;
  to: string;
  requirements: Requirement;
}

/** Every canExit connection touching a dungeon-kind screen: exactly the set the tracker graph leaves out. */
const dungeonConnections = (): ReachConnection[] =>
  find('connection', (c) => c.canExit
    && (getScreen(c.screenId).kind === 'dungeon' || getScreen(toScreenIdOf(c)).kind === 'dungeon'))
    .map((c) => ({ from: c.screenId, to: toScreenIdOf(c), requirements: c.requirements }));

/** The config-driven entrance gates the tracker resolver could not attach, mirrored from resolver.ts. */
const entranceGates = (config: LogicConfig): EntranceGate[] => [
  { // dungeon-011's entrance (connection-730)
    from: 'screen-250',
    to: 'screen-406',
    requirements: { allOf: [hasSword, { itemId: config.medallionRequirements.miseryMire }] },
  },
  { // dungeon-012's entrance (connection-761)
    from: 'screen-309',
    to: 'screen-446',
    requirements: { allOf: [hasSword, { itemId: config.medallionRequirements.turtleRock }, { itemId: 'item-032' }] },
  },
  { // dungeon-013's entrance (connection-793)
    from: 'screen-277',
    to: 'screen-407',
    requirements: hasCrystals(config.crystalsForGT),
  },
];

/**
 * Item ids the rules demand but NOTHING in the current dataset can grant (no
 * check's vanilla contents contain them, e.g. the dungeon big-key records and
 * the bomb-capability proxy, both flagged data gaps). They are granted as
 * start inventory so their locations stay live instead of permanently dead;
 * getBlockingItems follows satisfied anyOf branches, so an id with a real
 * obtainable alternative is never swept in. Self-healing: once a record grants
 * such an item, it stops being sourceless and the free grant disappears.
 */
const blockedSourcelessItems = (rules: ResolvedRules): Set<ItemId> => {
  const checks = all('check');
  const obtainable = new Set<ItemId>(rules.startInventory);
  const completed = new Set<CheckId>();
  for (const check of checks) {
    completed.add(check.id);
    for (const itemId of check.vanillaItemIds) obtainable.add(itemId);
  }

  const free = new Set<ItemId>();
  const addMissing = (requirement: Requirement | undefined): void => {
    if (requirement === undefined) return;
    for (const itemId of getBlockingItems(requirement, obtainable, completed)) free.add(itemId);
  };
  for (const connection of rules.connections) addMissing(connection.requirements);
  for (const check of checks) addMissing(rules.checkOverrides[check.id] ?? check.requirements);
  return free;
};

const resolveFillRules = (config: LogicConfig): ResolvedRules => {
  const base = resolveRules(config);
  const connections = [...base.connections, ...dungeonConnections()];
  const byPair = new Map<string, ReachConnection>();
  for (const c of connections) byPair.set(`${c.from}|${c.to}`, c);
  for (const gate of entranceGates(config)) {
    const edge = byPair.get(`${gate.from}|${gate.to}`);
    if (edge) edge.requirements = gate.requirements;
  }
  const widened: ResolvedRules = { connections, checkOverrides: base.checkOverrides, startInventory: base.startInventory };
  const startInventory = new Set<ItemId>([...base.startInventory, ...blockedSourcelessItems(widened)]);
  return { connections, checkOverrides: base.checkOverrides, startInventory };
};

export { resolveFillRules };
