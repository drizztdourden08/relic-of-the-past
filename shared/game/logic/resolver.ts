/* @layer shared-game @kind logic */
import type { CheckId, ConnectionRecord, ItemId, Requirement, ScreenId } from '../data';
import type { LogicConfig } from '../types';
import { find, getScreen } from '../data';
import type { ReachConnection } from './eval';
import { hasBeamSword, hasCrystals, hasSword } from '../data/requirements/helpers';

const toReachConnection = (c: ConnectionRecord): ReachConnection => ({
  from: c.fromScreenId,
  to: c.toScreenId,
  requirements: c.requirements,
});

/**
 * The tracker's reachability graph. Excludes dungeon-kind screens: dungeon
 * interiors have no traversal graph wired in yet (see the mode-overlay
 * comments below), so every edge touching one is left out rather than
 * pretending it's reachable.
 */
const overworldConnections = (): ReachConnection[] =>
  find('connection', c => getScreen(c.fromScreenId).kind !== 'dungeon' && getScreen(c.toScreenId).kind !== 'dungeon')
    .map(toReachConnection);

// ─── Menu — a virtual BFS root with no ScreenRecord of its own, so its two
// save-and-quit spawn points can't come from the screen/connection facade.
// Returns fresh objects every call: the overlays below mutate `.requirements`
// in place, and these would otherwise be shared, mutable state across calls. ───
const menuConnections = (): ReachConnection[] => [
  { from: 'menu', to: 'screen-204' }, // the starting house spawn
  { from: 'menu', to: 'screen-190' }, // the mountain hermit's cave spawn
];

interface ResolvedRules {
  connections: ReachConnection[];
  /** Config-driven requirement overrides, keyed by CheckId (e.g. the pedestal's pendant count). */
  checkOverrides: Partial<Record<CheckId, Requirement>>;
  startInventory: Set<ItemId>;
}

/** Requirement for using a save-and-quit spawn point not freely available in this config. */
const getSQGateRequirement = (dest: ScreenId): Requirement => {
  switch (dest) {
    case 'screen-204': // the starting house
      return { checkId: 'check-004' }; // the princess has been brought to safety
    case 'screen-190': // the mountain hermit's cave
      // No dedicated "carried him home" event check exists yet — his own
      // check (granting the light source) completes at the same story beat,
      // so it's used as the best-available proxy. Flagged in the migration report.
      return { checkId: 'check-060' };
    default:
      return { impossible: true };
  }
};

const resolveRules = (config: LogicConfig): ResolvedRules => {
  const startInventory = new Set(config.startingItems);
  const baseConnections = [...menuConnections(), ...overworldConnections()];

  if (config.mode === 'no-logic') {
    return { connections: baseConnections, checkOverrides: {}, startInventory };
  }

  const connections = baseConnections;
  const byPair = new Map<string, ReachConnection>();
  for (const c of connections) byPair.set(`${c.from}|${c.to}`, c);

  /** Applies a requirement to an edge already in the graph; a no-op otherwise
   *  (e.g. dungeon-internal edges, which aren't in the graph until dungeon
   *  traversal is wired in — matching the pre-migration dormant state). */
  const setRequirementIfPresent = (from: string, to: string, requirement: Requirement | undefined): void => {
    const existing = byPair.get(`${from}|${to}`);
    if (existing) existing.requirements = requirement;
  };

  const checkOverrides: Partial<Record<CheckId, Requirement>> = {};

  // --- Medallion / crystal gates on the real dungeon-entrance connections ---
  // Dormant today (dungeon screens are excluded from the graph above) but
  // correctly id-keyed for when dungeon traversal is wired in, instead of the
  // bare DungeonId strings that never matched anything.
  setRequirementIfPresent('screen-250', 'screen-406', { // dungeon-011's entrance (connection-730)
    allOf: [hasSword, { itemId: config.medallionRequirements.miseryMire }],
  });
  setRequirementIfPresent('screen-309', 'screen-446', { // dungeon-012's entrance (connection-761)
    allOf: [hasSword, { itemId: config.medallionRequirements.turtleRock }, { itemId: 'item-032' }],
  });
  setRequirementIfPresent('screen-277', 'screen-407', hasCrystals(config.crystalsForGT)); // dungeon-013's entrance (connection-793)

  // --- Pedestal requirement ---
  checkOverrides['check-072'] = { count: { groupId: 'Pendants', n: config.pendantsForPedestal } };

  // --- S&Q destination gating ---
  // The hermit's cave has no menu-sourced connection (true before this
  // migration too — there is no real screen id to gate), so it's intentionally absent.
  const sqDestinations: ScreenId[] = ['screen-204', 'screen-190'];
  for (const dest of sqDestinations) {
    if (!config.saveQuitDestinations.includes(dest)) {
      setRequirementIfPresent('menu', dest, getSQGateRequirement(dest));
    }
  }

  // --- Vanilla mode: gate progression ---
  if (config.mode === 'vanilla') {
    const intro = byPair.get('menu|screen-204');
    if (intro) {
      intro.requirements = intro.requirements
        ? { anyOf: [{ checkId: 'check-001' }, intro.requirements] } // the player character is out of bed
        : { checkId: 'check-001' };
    }

    setRequirementIfPresent('screen-227', 'screen-062', { checkId: 'check-002' }); // the rescue has begun
    setRequirementIfPresent('screen-204', 'screen-072', { checkId: 'check-004' }); // the princess has been brought to safety
    // screen-062|screen-106 (the overworld approach to the first tower's
    // entrance): screen-106 is dungeon-kind, so this edge is excluded from
    // the graph above and this is dormant today too (same root cause as the
    // medallion gates) — kept so it activates correctly once dungeon
    // traversal is wired in.
    setRequirementIfPresent('screen-062', 'screen-106', hasBeamSword);
  }

  // --- Swordless mode: remove the sword requirement on that same approach ---
  if (config.swordMode === 'swordless') {
    setRequirementIfPresent('screen-062', 'screen-106', undefined);
  }

  // --- Open mode: that approach also opens via the cloak item ---
  if (config.mode === 'open') {
    setRequirementIfPresent('screen-062', 'screen-106', { anyOf: [hasSword, { itemId: 'item-026' }] });
  }

  return { connections, checkOverrides, startInventory };
};

export { resolveRules };
export type { ResolvedRules };
