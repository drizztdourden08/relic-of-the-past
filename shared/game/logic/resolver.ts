/* @layer shared-game @kind logic */
/**
 * The vanilla tracker's rules for one configuration: the logic graph (logic-graph.ts) with the
 * opening's story gates, the save-and-quit spawns, the configurable gates (medallions, the last
 * tower's crystals, the pedestal's pendants) and every check's own rule laid over it.
 */
import type { CheckId, ItemId, Requirement, ScreenId } from '../data';
import type { LogicConfig } from '../types';
import { all, ITEM_GROUP_IDS } from '../data';
import type { ReachConnection } from './eval';
import { logicConnections } from './logic-graph';
import { LOCATION_RULES } from './vanilla-rules/location-rules.data';
import { R } from './vanilla-rules/rule-words';
import { screenOfName } from './vanilla-rules/screen-names';

interface ResolvedRules {
  connections: ReachConnection[];
  /** Requirement overrides keyed by CheckId: the reference's location rules and the config-driven ones. */
  checkOverrides: Partial<Record<CheckId, Requirement>>;
  startInventory: Set<ItemId>;
}

const STARTING_HOUSE: ScreenId = 'screen-204';
const STARTING_HOUSE_INTRO: ScreenId = 'screen-205';
const SECRET_PASSAGE: ScreenId = 'screen-171';
const OLD_MAN_CAVE: ScreenId = 'screen-190';
const OUT_OF_BED: Requirement = { checkId: 'check-001' };
/** The mountain hermit's own check completes at the beat that opens his cave as a spawn. */
const OLD_MAN_HOME: Requirement = { checkId: 'check-060' };

const resolveRules = (config: LogicConfig): ResolvedRules => {
  const startInventory = new Set(config.startingItems);
  const connections = logicConnections();
  const byPair = new Map<string, ReachConnection>();
  for (const c of connections) byPair.set(`${c.from}|${c.to}`, c);

  /** Sets an edge's rule, adding the edge when the graph has none. */
  const edge = (from: string | null, to: string | null, requirement: Requirement | undefined): void => {
    if (from === null || to === null) return;
    const existing = byPair.get(`${from}|${to}`);
    if (existing) { existing.requirements = requirement; return; }
    const added: ReachConnection = requirement ? { from, to, requirements: requirement } : { from, to };
    connections.push(added);
    byPair.set(`${from}|${to}`, added);
  };
  const named = (from: string, to: string, requirement: Requirement | undefined): void => edge(screenOfName(from), screenOfName(to), requirement);

  if (config.mode === 'no-logic') {
    return { connections, checkOverrides: {}, startInventory };
  }

  // The opening. The player wakes in the starting house; the rain leaves only the castle's
  // passage open, and the walk out of the house waits for the princess to be safe.
  edge('menu', STARTING_HOUSE, config.saveQuitDestinations.includes(STARTING_HOUSE) ? undefined : { anyOf: [OUT_OF_BED, R.princessSafe] });
  edge(STARTING_HOUSE, STARTING_HOUSE_INTRO, undefined);
  edge(STARTING_HOUSE, screenOfName('Hyrule Castle Secret Entrance'), undefined);
  edge(STARTING_HOUSE, screenOfName('Light World'), R.princessSafe);
  edge(screenOfName('Hyrule Castle Secret Entrance'), SECRET_PASSAGE, undefined);
  // The castle opens from the courtyard once the uncle has been met, so the first thing within
  // reach is the uncle himself; the side doors and the Sanctuary's own door wait for the princess.
  named('Hyrule Castle Courtyard', 'Hyrule Castle', R.uncleMet);
  named('Hyrule Castle', 'Hyrule Castle Ledge', R.princessSafe);
  named('Sanctuary', 'Light World', R.princessSafe);
  // The second spawn: the hermit's cave, once he is home.
  edge('menu', OLD_MAN_CAVE, config.saveQuitDestinations.includes(OLD_MAN_CAVE) ? undefined : OLD_MAN_HOME);

  // The configurable gates.
  named('Dark Desert', 'Misery Mire (Entrance)', R.all(R.pearl, R.sword, { itemId: config.medallionRequirements.miseryMire }));
  named('Dark Death Mountain (Top)', 'Turtle Rock (Entrance)', R.all(R.pearl, R.sword, { itemId: config.medallionRequirements.turtleRock }));
  named('Dark Death Mountain (Top)', 'Ganons Tower (Entrance)', { count: { groupId: ITEM_GROUP_IDS.Crystals, n: config.crystalsForGT } });
  const towerApproach: Requirement | undefined = config.swordMode === 'swordless'
    ? R.any(R.cape, R.agahnim1)
    : config.mode === 'open' ? R.any(R.sword, R.cape, R.agahnim1) : R.any(R.cape, R.beamSword, R.agahnim1);
  named('Hyrule Castle Ledge', 'Agahnims Tower', towerApproach);

  // Every check's own rule, by the reference's name of the check.
  const checkOverrides: Partial<Record<CheckId, Requirement>> = {};
  for (const check of all('check')) {
    const rule = LOCATION_RULES[check.randomizerName];
    if (rule) checkOverrides[check.id] = rule;
  }
  checkOverrides['check-072'] = { count: { groupId: ITEM_GROUP_IDS.Pendants, n: config.pendantsForPedestal } };

  return { connections, checkOverrides, startInventory };
};

export { resolveRules };
export type { ResolvedRules };
