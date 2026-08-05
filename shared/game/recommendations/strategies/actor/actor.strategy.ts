/* @layer shared-game @kind logic */
/**
 * The `actor` comparison strategy — replaces the two hand-written detectors
 * `actor-combat.ts` and `actor-spawns.ts` (both deleted), merged here because
 * the engine's contract is one strategy per kind (`strategyFor(kind)` is a
 * single lookup).
 *
 * Unlike a screen or a connection, an `ActorRecord` is not scoped to the
 * current screen — the same sprite type is catalogued once and can spawn
 * anywhere — so `subjects` reaches across the whole catalogue rather than
 * folding in only the current screen's own records. `COMBAT_PROBE`'s own
 * `applies`/`read` gate narrows that back down to whatever this pass actually
 * observed.
 */
import { all } from '../../../data';
import type { ComparisonStrategy } from '../../compare/probe.types';
import { COMBAT_PROBE } from './combat.probes';
import { ACTOR_SPAWNS_PROBE } from './spawns.set';

const actorStrategy: ComparisonStrategy<'actor'> = {
  kind: 'actor',
  subjects: () => all('actor'),
  fields: [COMBAT_PROBE],
  sets: [ACTOR_SPAWNS_PROBE],
};

export { actorStrategy };
