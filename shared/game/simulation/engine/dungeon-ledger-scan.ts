/* @layer shared-game @kind logic */
/**
 * Fills a dungeon group's ledger from one observed room: every chest and
 * key-drop guard the room holds becomes an owed entry (regardless of whether
 * it is currently reachable), and anything else the engine already turned
 * into an actionable target (a standing item, an NPC check) is recorded the
 * first time it is seen. Gates — doors, cracked walls, switches — are never
 * owed themselves; they only explain why something else is blocked.
 *
 * Which of the two a target is comes off `SimTarget.role`. It used to come from
 * matching the target's English noun against a word list, so the ledger's answer
 * to "does this dungeon still owe something" depended on the wording of a log
 * label — reword "key door" and every locked door became a check the run owed.
 */
import type { SimObservation } from '../types';
import type { DungeonId } from '../../data';
import { keyAvailable } from './explorer';
import { chestKey, spriteKey } from './discover';
import { BOMBABLE_ATTR_MIN, BOMBABLE_ATTR_MAX } from './discover-bombs';
import { dungeonGroupForScreen, dungeonForScreen } from '../../logic/queries/dungeon-group';
import { ensureLedger, upsertOwed, pruneDoneChecks } from './dungeon-ledger';
import type { EngineState, SimTarget } from './state';

/** Any bombable-attribute tile still standing, ignoring reach — a wall the
 *  flood already treats as impassable never shows up as a target without bombs. */
const hasUnblastedWall = (obs: SimObservation): boolean => {
  const bundle = obs.grids;
  if (!bundle) return false;
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  return grids.some(g => g.some(row => row.some(a => a >= BOMBABLE_ATTR_MIN && a <= BOMBABLE_ATTR_MAX)));
};

/** Best-effort reason a present-but-not-actionable check is blocked, from the
 *  same gates discoverTargets already checks for doors/walls/kills. */
const guessBlocker = (state: EngineState, obs: SimObservation, dungeon: DungeonId | null): string | undefined => {
  const inter = obs.interactables;
  if (!state.reachTokens.has('bombs')
    && (hasUnblastedWall(obs) || (inter?.doors.some(d => d.kind === 'bombable' && !d.opened) ?? false))) {
    return 'bombs';
  }
  // Outside a dungeon there is no key bucket to be short of, so a locked door
  // there explains nothing and no token is owed.
  if (!dungeon) return undefined;
  if (inter?.doors.some(d => d.kind === 'small-key' && !d.opened) && !keyAvailable(state, dungeon)) {
    return `smallkey:${dungeon}`;
  }
  if (inter?.doors.some(d => d.kind === 'big-key' && !d.opened) && !state.bigKeys.has(dungeon)) {
    return `bigkey:${dungeon}`;
  }
  return undefined;
};

/**
 * Record what the current room owes into its dungeon group's ledger. `targets`
 * is the SAME list `discoverTargets` already produced this step — reused
 * rather than re-derived, so actionability here never disagrees with what the
 * engine is actually about to trigger.
 */
const updateDungeonLedger = (state: EngineState, obs: SimObservation, targets: SimTarget[]): void => {
  const group = dungeonGroupForScreen(state.virtual.screenId);
  if (group == null) return;
  const ledger = ensureLedger(state.ledgers, group);
  if (ledger.complete) return;

  pruneDoneChecks(ledger, state.done);
  const inter = obs.interactables;
  if (!inter) return;

  // A chest's `opened` bit is the live ground truth, independent of `done` —
  // strike it even if this run did not open it itself (a pre-opened save).
  const openedChests = new Set(inter.chests.filter(c => c.opened).map(chestKey));
  ledger.owed = ledger.owed.filter(o => !openedChests.has(o.checkId));

  const dungeon = dungeonForScreen(state.virtual.screenId);
  const actionable = new Set(targets.map(t => t.key));
  const handled = new Set<string>();

  for (const chest of inter.chests) {
    const key = chestKey(chest);
    handled.add(key);
    if (chest.opened || state.done.has(key)) continue;
    upsertOwed(ledger, key, chest.roomId, actionable.has(key) ? undefined : guessBlocker(state, obs, dungeon));
  }

  for (const sprite of inter.sprites) {
    if (!sprite.carriesKey && !sprite.carriesBigKey) continue;
    const key = spriteKey(sprite);
    handled.add(key);
    if (state.done.has(key)) continue;
    upsertOwed(ledger, key, sprite.roomId, actionable.has(key) ? undefined : guessBlocker(state, obs, dungeon));
  }

  for (const target of targets) {
    if (target.role === 'gate' || handled.has(target.key)) continue;
    upsertOwed(ledger, target.key, target.roomId, undefined);
  }
};

export { updateDungeonLedger };
