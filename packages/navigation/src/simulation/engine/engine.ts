/* @layer shared-game @kind logic */
import type { SimObservation, SimEvent, TriggerAction } from '../types';
import type { ScreenEdge } from './traversal/traversal.type';
import { buildAdjacency } from './traversal/build-adjacency';
import { findScreenPath } from './traversal/find-screen-path';
import { reachableFrom } from './traversal/reachable-from';
import { reachableDiscovered } from './discovered-graph/reachable-discovered';
import { findDiscoveredPath } from './discovered-graph/find-discovered-path';
import { discoveredExitFor } from './discovered-graph/discovered-exit-for';
import { recordExits } from './discovered-graph/record-exits';
import { requirementsMet } from '../requirements-map/requirements-met';
import { buildReachContext } from './explorer/build-reach-context';
import { syncReachTokens } from './explorer/sync-reach-tokens';
import { resetFrontier } from './explorer/reset-frontier';
import { evaluateOutcome } from './goal/evaluate-outcome';
import { goalCheckDone } from './goal/goal-check-done';
import { allChecksDone } from './goal/all-checks-done';
import { cloneSnapshot } from '../detect/flag-snapshot/clone-snapshot';
import { discoverTargets } from './discover/discover-targets';
import { verifyStep } from './verify-step';
import { narrative } from './event-log/narrative';
import { debug } from './event-log/debug';
import { screenLabel } from './screen-label';
import { foundMessage } from './hop/found-message';
import { positionMessage } from './hop/position-message';
import { landingTile } from './hop/landing-tile';
import { emitHop } from './hop/emit-hop';
import { spendKeysForEdge } from './hop/spend-keys-for-edge';
import { emitEntryTrapSlam } from './side-effects/emit-entry-trap-slam';
import { interceptTrap } from './side-effects/intercept-trap';
import { unionReach } from './regions/union-reach';
import { stampReach } from './regions/stamp-reach';
import { regionCovered } from './regions/region-covered';
import { markWayBackUsed } from './regions/mark-way-back-used';
import { unexploredRegionJobs } from './regions/unexplored-region-jobs';
import { takeRegionJob } from './regions/take-region-job';
import { updateDungeonLedger } from './dungeon-ledger-scan';
import { closeIdleDungeonGroups } from './dungeon-ledger-lifecycle/close-idle-dungeon-groups';
import { inCompletedGroup } from './dungeon-ledger-lifecycle/in-completed-group';
import type { EngineState } from './state/state.type';
import { cloneState } from './state/clone-state';
import type { EngineDeps, StepResult } from './engine.type';
import { RIGHT_ARROW } from '../arrow.constants';

const createEngine = ({ adjacency = buildAdjacency(), totalChecks }: EngineDeps = {}) => {
  const canPass = (s: EngineState) => (edge: ScreenEdge): boolean => requirementsMet(edge.requirements, buildReachContext(s));

  const queueTargets = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
    const targets = discoverTargets(s, obs, obs.reached);
    for (const target of targets) {
      if (!s.pending.some(t => t.key === target.key)) {
        s.pending.push(target);
        events.push(narrative(s, foundMessage(target)));
      }
    }
    updateDungeonLedger(s, obs, targets);
  };

  const refreshFrontier = (s: EngineState, obs: SimObservation): void => {
    if (obs.exits) recordExits(s.discovered, s.virtual.screenId, obs.exits);
    if (obs.exits) markWayBackUsed(s.arrivals, s.cameFrom, obs.exits);
    const reachable = s.discovered.size > 0
      ? reachableDiscovered(s.discovered, s.virtual.screenId)
      : reachableFrom(adjacency, s.virtual.screenId, canPass(s));
    for (const id of reachable) s.reachedScreens.add(id);
    s.frontier = [...reachable].filter(id =>
      id !== s.virtual.screenId && !s.visited.has(id) && !inCompletedGroup(s, id));
    s.regionJobs = unexploredRegionJobs(s.discovered, s.regionReach, s.visited, s.arrivals, s.crossings).filter(j => j.to !== s.virtual.screenId);
  };

  const observe = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
    s.inventory = new Set(obs.inventory);
    syncReachTokens(s);
    const tile = obs.virtual.screenId === s.virtual.screenId ? obs.virtual.tile : s.virtual.tile;
    s.virtual = { screenId: s.virtual.screenId, tile };
    const firstVisit = !s.everVisited.has(s.virtual.screenId);
    s.visited.add(s.virtual.screenId);
    s.everVisited.add(s.virtual.screenId);
    stampReach(s.regionReach, s.virtual.screenId, s.virtual.tile);
    if (obs.reached) unionReach(s.regionReach, s.virtual.screenId, obs.reached);
    if (firstVisit) emitEntryTrapSlam(s, obs, events);
    queueTargets(s, obs, events);
    refreshFrontier(s, obs);
    closeIdleDungeonGroups(s, events);
    s.phase = 'planning';
  };

  const finish = (s: EngineState, events: SimEvent[], outcome: NonNullable<EngineState['outcome']>): void => {
    s.outcome = outcome;
    s.phase = 'done';
    events.push(narrative(s, positionMessage('END', s.virtual.tile)), narrative(s, `Exiting ${screenLabel(s.virtual.screenId)}`), narrative(s, `Run finished: ${outcome}`));
  };

  const routeTo = (s: EngineState, target: string): string[] | null => (s.discovered.size > 0
    ? findDiscoveredPath(s.discovered, s.virtual.screenId, target)
    : findScreenPath({ adjacency, from: s.virtual.screenId, to: target, canPass: canPass(s) })?.path ?? null);

  const plan = (s: EngineState, events: SimEvent[]): void => {
    const outcome = evaluateOutcome(s, totalChecks);
    if (outcome) { finish(s, events, outcome); return; }
    if (s.pending.length > 0) { s.currentTarget = s.pending.shift(); s.phase = 'triggering'; return; }
    if (s.route.length > 0) { s.phase = 'traversing'; return; }
    if (s.frontier.length > 0) {
      const target = s.frontier.shift()!;
      const path = routeTo(s, target);
      if (path) {
        s.route = path.slice(1);
        s.phase = 'traversing';
        events.push(narrative(s, `Running ${screenLabel(s.virtual.screenId)} ${RIGHT_ARROW} ${screenLabel(target)}`));
      }
      return;
    }
    const regionRoute = takeRegionJob(s);
    if (regionRoute) {
      s.route = regionRoute;
      s.phase = 'traversing';
      events.push(narrative(s, `Running ${screenLabel(s.virtual.screenId)} ${RIGHT_ARROW} ${screenLabel(regionRoute[regionRoute.length - 1])} (new region)`));
      return;
    }
    if (s.progressSinceEpoch) {
      resetFrontier(s);
      s.phase = 'observing';
      events.push(debug(s, `epoch ${s.epoch}: re-exploring after progress`));
      return;
    }
    finish(s, events, goalCheckDone(s) || allChecksDone(s, totalChecks) ? 'completed' : 'not-completable');
  };

  const traverse = (s: EngineState, events: SimEvent[]): void => {
    if (s.route.length === 0) { s.phase = 'observing'; return; }
    const from = s.virtual.screenId;
    const next = s.route.shift()!;
    const discoveredExit = s.discovered.size > 0
      ? discoveredExitFor(s.discovered, from, next, s.route.length === 0 ? s.pendingEdgeSig : null)
      : undefined;
    const edge = s.discovered.size > 0 ? undefined : (adjacency.get(from) ?? []).find(e => e.to === next && canPass(s)(e));
    if (!discoveredExit && !edge) {
      s.route = [];
      s.phase = 'observing';
      events.push(debug(s, `route aborted: no passable edge ${from} ${RIGHT_ARROW} ${next}`));
      return;
    }
    if (edge) spendKeysForEdge(s, edge);
    const tile = landingTile(discoveredExit, edge);
    if (s.route.length > 0 && s.visited.has(next) && regionCovered(s.regionReach, next, tile)) {
      s.virtual = { screenId: next, tile };
      events.push(narrative(s, `Backtrack through ${screenLabel(next)} entering at ${tile.col},${tile.row}`));
      return;
    }
    emitHop(s, events, next, discoveredExit, edge);
    if (s.route.length === 0) s.pendingEdgeSig = null;
    s.phase = 'observing';
  };

  const trigger = (s: EngineState, obs: SimObservation, events: SimEvent[], actions: TriggerAction[]): void => {
    const target = s.currentTarget;
    if (!target) { s.phase = 'observing'; return; }
    if (interceptTrap(s, obs, events, actions)) return;
    s.preTrigger = cloneSnapshot(obs.flags);
    actions.push(target.action);
    events.push(narrative(s, `${target.verb} ${target.noun}`));
    s.phase = 'verifying';
  };

  const step = (input: EngineState, obs: SimObservation): StepResult => {
    const s = cloneState(input);
    s.step += 1;
    const events: SimEvent[] = [];
    const actions: TriggerAction[] = [];

    if (s.phase === 'idle' || s.phase === 'observing') observe(s, obs, events);
    else if (s.phase === 'planning') plan(s, events);
    else if (s.phase === 'traversing') traverse(s, events);
    else if (s.phase === 'triggering') trigger(s, obs, events, actions);
    else if (s.phase === 'verifying') verifyStep(s, obs, events);

    return { actions, events, nextState: s };
  };

  return { step };
};

export { createEngine };
export type { EngineDeps, StepResult } from './engine.type';
