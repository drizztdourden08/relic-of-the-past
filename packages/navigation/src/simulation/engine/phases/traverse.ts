/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import type { EngineEnv } from '../engine.type';
import type { EngineState } from '../state/state.type';
import type { HopLink } from '../hop/hop.type';
import { discoveredExitFor } from '../discovered-graph/discovered-exit-for';
import { narrative } from '../event-log/narrative';
import { debug } from '../event-log/debug';
import { screenLabel } from '../screen-label';
import { landingTile } from '../hop/landing-tile';
import { emitHop } from '../hop/emit-hop';
import { spendKeysForEdge } from '../hop/spend-keys-for-edge';
import { regionCovered } from '../regions/region-covered';
import { canPass } from './can-pass';

const hopLinkTo = (env: EngineEnv, s: EngineState, from: string, next: string): HopLink => {
  if (s.discovered.size > 0) {
    return { exit: discoveredExitFor(s.discovered, from, next, s.route.length === 0 ? s.pendingEdgeSig : null), edge: undefined };
  }
  return { exit: undefined, edge: (env.adjacency.get(from) ?? []).find(e => e.to === next && canPass(s)(e)) };
};

const traverse = (env: EngineEnv, s: EngineState, events: SimEvent[]): void => {
  const next = s.route.shift();
  if (next === undefined) { s.phase = 'observing'; return; }
  const from = s.virtual.screenId;
  const link = hopLinkTo(env, s, from, next);
  if (!link.exit && !link.edge) {
    s.route = [];
    s.phase = 'observing';
    events.push(debug(s, `route aborted: no passable edge ${from} -> ${next}`));
    return;
  }
  if (link.edge) spendKeysForEdge(s, link.edge);
  const tile = landingTile(link);
  if (s.route.length > 0 && s.visited.has(next) && regionCovered(s.regionReach, next, tile)) {
    s.virtual = { screenId: next, tile };
    events.push(narrative(s, `Backtrack through ${screenLabel(next)} entering at ${tile.col},${tile.row}`));
    return;
  }
  emitHop(s, events, next, link);
  if (s.route.length === 0) s.pendingEdgeSig = null;
  s.phase = 'observing';
};

export { traverse };
