/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import type { EngineEnv } from '../engine.type';
import type { EngineState } from '../state/state.type';
import { findScreenPath } from '../traversal/find-screen-path';
import { findDiscoveredPath } from '../discovered-graph/find-discovered-path';
import { resetFrontier } from '../explorer/reset-frontier';
import { evaluateOutcome } from '../goal/evaluate-outcome';
import { goalCheckDone } from '../goal/goal-check-done';
import { allChecksDone } from '../goal/all-checks-done';
import { narrative } from '../event-log/narrative';
import { debug } from '../event-log/debug';
import { screenLabel } from '../screen-label';
import { takeRegionJob } from '../regions/take-region-job';
import { itemAt } from '../../../checked-access';
import { canPass } from './can-pass';
import { finishRun } from './finish-run';

const routeTo = (env: EngineEnv, s: EngineState, target: string): string[] | null => (s.discovered.size > 0
  ? findDiscoveredPath(s.discovered, s.virtual.screenId, target)
  : findScreenPath({ adjacency: env.adjacency, from: s.virtual.screenId, to: target, canPass: canPass(s) })?.path ?? null);

const planFrontier = (env: EngineEnv, s: EngineState, events: SimEvent[], target: string): void => {
  const path = routeTo(env, s, target);
  if (!path) return;
  s.route = path.slice(1);
  s.phase = 'traversing';
  events.push(narrative(s, `Running ${screenLabel(s.virtual.screenId)} -> ${screenLabel(target)}`));
};

const planRegionJob = (s: EngineState, events: SimEvent[]): boolean => {
  const regionRoute = takeRegionJob(s);
  if (!regionRoute) return false;
  s.route = regionRoute;
  s.phase = 'traversing';
  events.push(narrative(s, `Running ${screenLabel(s.virtual.screenId)} -> ${screenLabel(itemAt(regionRoute, regionRoute.length - 1))} (new region)`));
  return true;
};

const planEnd = (env: EngineEnv, s: EngineState, events: SimEvent[]): void => {
  if (s.progressSinceEpoch) {
    resetFrontier(s);
    s.phase = 'observing';
    events.push(debug(s, `epoch ${s.epoch}: re-exploring after progress`));
    return;
  }
  finishRun(s, events, goalCheckDone(s) || allChecksDone(s, env.totalChecks) ? 'completed' : 'not-completable');
};

const plan = (env: EngineEnv, s: EngineState, events: SimEvent[]): void => {
  const outcome = evaluateOutcome(s, env.totalChecks);
  if (outcome) { finishRun(s, events, outcome); return; }
  if (s.pending.length > 0) { s.currentTarget = s.pending.shift(); s.phase = 'triggering'; return; }
  if (s.route.length > 0) { s.phase = 'traversing'; return; }
  const target = s.frontier.shift();
  if (target !== undefined) { planFrontier(env, s, events, target); return; }
  if (planRegionJob(s, events)) return;
  planEnd(env, s, events);
};

export { plan };
