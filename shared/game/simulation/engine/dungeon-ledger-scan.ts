/* @layer shared-game @kind logic */
import type { SimObservation } from '../types';
import type { DungeonId } from '../../data';
import { keyAvailable } from './explorer/key-available';
import { chestKey } from './discover/chest-key';
import { spriteKey } from './discover/sprite-key';
import { attrGridsOf } from './discover-bombs/attr-grids-of';
import { isBombableAttr } from './discover-bombs/is-bombable-attr';
import { dungeonGroupForScreen, dungeonForScreen } from '../../logic/queries/dungeon-group';
import { ensureLedger } from './dungeon-ledger/ensure-ledger';
import { upsertOwed } from './dungeon-ledger/upsert-owed';
import { pruneDoneChecks } from './dungeon-ledger/prune-done-checks';
import type { EngineState, SimTarget } from './state/state.type';

const hasUnblastedWall = (obs: SimObservation): boolean => {
  const bundle = obs.grids;
  if (!bundle) return false;
  return attrGridsOf(bundle).some(g => g.some(row => row.some(isBombableAttr)));
};

const guessBlocker = (state: EngineState, obs: SimObservation, dungeon: DungeonId | null): string | undefined => {
  const inter = obs.interactables;
  if (!state.reachTokens.has('bombs')
    && (hasUnblastedWall(obs) || (inter?.doors.some(d => d.kind === 'bombable' && !d.opened) ?? false))) {
    return 'bombs';
  }
  if (!dungeon) return undefined;
  if (inter?.doors.some(d => d.kind === 'small-key' && !d.opened) && !keyAvailable(state, dungeon)) {
    return `smallkey:${dungeon}`;
  }
  if (inter?.doors.some(d => d.kind === 'big-key' && !d.opened) && !state.bigKeys.has(dungeon)) {
    return `bigkey:${dungeon}`;
  }
  return undefined;
};

const updateDungeonLedger = (state: EngineState, obs: SimObservation, targets: SimTarget[]): void => {
  const group = dungeonGroupForScreen(state.virtual.screenId);
  if (group == null) return;
  const ledger = ensureLedger(state.ledgers, group);
  if (ledger.complete) return;

  pruneDoneChecks(ledger, state.done);
  const inter = obs.interactables;
  if (!inter) return;

  const openedChests = new Set(inter.chests.filter(c => c.opened).map(chestKey));
  ledger.owed = ledger.owed.filter(o => !openedChests.has(o.checkId));

  const dungeon = dungeonForScreen(state.virtual.screenId);
  const actionable = new Set(targets.map(t => t.key));
  const handled = new Set<string>();
  const blockerFor = (key: string): string | undefined => (actionable.has(key) ? undefined : guessBlocker(state, obs, dungeon));

  for (const chest of inter.chests) {
    const key = chestKey(chest);
    handled.add(key);
    if (chest.opened || state.done.has(key)) continue;
    upsertOwed(ledger, key, chest.roomId, blockerFor(key));
  }

  for (const sprite of inter.sprites) {
    if (!sprite.carriesKey && !sprite.carriesBigKey) continue;
    const key = spriteKey(sprite);
    handled.add(key);
    if (state.done.has(key)) continue;
    upsertOwed(ledger, key, sprite.roomId, blockerFor(key));
  }

  for (const target of targets) {
    if (target.role === 'gate' || handled.has(target.key)) continue;
    upsertOwed(ledger, target.key, target.roomId, undefined);
  }
};

export { updateDungeonLedger };
