/* @layer shared-game @kind logic */
/**
 * The pure step state machine: observing → planning → traversing → triggering →
 * verifying → observing… Steps never mutate their input. Once observations carry
 * flood-detected exits, traversal runs purely on that discovered graph.
 */
import type { SimObservation, SimEvent, TriggerAction } from '../types';
import type { Adjacency, ScreenEdge } from './traversal';
import { buildAdjacency, findScreenPath, reachableFrom } from './traversal';
import { reachableDiscovered, findDiscoveredPath, discoveredExitFor, recordExits } from './discovered-graph';
import { requirementsMet } from '../requirements-map';
import { buildReachContext, syncReachTokens, resetFrontier } from './explorer';
import { evaluateOutcome, goalCheckDone, allChecksDone } from './goal';
import { cloneSnapshot } from '../detect/flag-snapshot';
import { discoverTargets } from './discover';
import { verifyStep } from './verify-step';
import { narrative, debug, foundMsg, screenLabel, posMsg, landingTile, emitHop, spendKeysForEdge, emitEntryTrapSlam, interceptTrap } from './step-helpers';
import { unionReach, stampReach, regionCovered, markWayBackUsed, unexploredRegionJobs, takeRegionJob } from './regions';
import { updateDungeonLedger } from './dungeon-ledger-scan';
import { closeIdleDungeonGroups, inCompletedGroup } from './dungeon-ledger-lifecycle';
import type { EngineState } from './state';
import { cloneState } from './state';

interface EngineDeps {
  adjacency?: Adjacency;
  totalChecks?: number;
}

interface StepResult {
  actions: TriggerAction[];
  events: SimEvent[];
  nextState: EngineState;
}

const createEngine = ({ adjacency = buildAdjacency(), totalChecks }: EngineDeps = {}) => {
  const canPass = (s: EngineState) => (edge: ScreenEdge): boolean => requirementsMet(edge.requirements, buildReachContext(s));

  const observe = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
    s.inventory = new Set(obs.inventory);
    syncReachTokens(s);
    // Adopt the runner's REAL tile only when it matches the virtual screen.
    const tile = obs.virtual.screenId === s.virtual.screenId ? obs.virtual.tile : s.virtual.tile;
    s.virtual = { screenId: s.virtual.screenId, tile };
    const firstVisit = !s.everVisited.has(s.virtual.screenId);
    s.visited.add(s.virtual.screenId);
    s.everVisited.add(s.virtual.screenId);
    stampReach(s.regionReach, s.virtual.screenId, s.virtual.tile);
    if (obs.reached) unionReach(s.regionReach, s.virtual.screenId, obs.reached);
    if (firstVisit) emitEntryTrapSlam(s, obs, events);

    // The detect flood (obs.reached) is the ONLY flood — see discover.ts.
    const targets = discoverTargets(s, obs, obs.reached);
    for (const target of targets) {
      if (!s.pending.some(t => t.key === target.key)) {
        s.pending.push(target);
        events.push(narrative(s, foundMsg(target)));
      }
    }
    updateDungeonLedger(s, obs, targets);

    // Game-driven mode: exits observed → frontier comes purely from the discovered graph.
    if (obs.exits) recordExits(s.discovered, s.virtual.screenId, obs.exits);
    // The doorway we just walked through is spent from this side as well.
    if (obs.exits) markWayBackUsed(s.arrivals, s.cameFrom, obs.exits);
    const reachable = s.discovered.size > 0
      ? reachableDiscovered(s.discovered, s.virtual.screenId)
      : reachableFrom(adjacency, s.virtual.screenId, canPass(s));
    for (const id of reachable) s.reachedScreens.add(id);
    // A dungeon group settled as complete owes nothing, so its screens stay out
    // of the frontier for the rest of the run. Without this the run keeps walking
    // back through a dungeon it has already finished.
    s.frontier = [...reachable].filter(id =>
      id !== s.virtual.screenId && !s.visited.has(id) && !inCompletedGroup(s, id));
    // Visited rooms entered OUTSIDE their explored region (a hall behind a different door) still owe a visit.
    s.regionJobs = unexploredRegionJobs(s.discovered, s.regionReach, s.visited, s.arrivals).filter(j => j.to !== s.virtual.screenId);
    closeIdleDungeonGroups(s, events);
    s.phase = 'planning';
  };

  const finish = (s: EngineState, events: SimEvent[], outcome: NonNullable<EngineState['outcome']>): void => {
    s.outcome = outcome;
    s.phase = 'done';
    events.push(narrative(s, posMsg('END', s.virtual.tile)), narrative(s, `Exiting ${screenLabel(s.virtual.screenId)}`), narrative(s, `Run finished: ${outcome}`));
  };

  const plan = (s: EngineState, events: SimEvent[]): void => {
    const outcome = evaluateOutcome(s, totalChecks);
    if (outcome) { finish(s, events, outcome); return; }
    if (s.pending.length > 0) { s.currentTarget = s.pending.shift(); s.phase = 'triggering'; return; }
    if (s.route.length > 0) { s.phase = 'traversing'; return; }
    if (s.frontier.length > 0) {
      const target = s.frontier.shift()!;
      const path = s.discovered.size > 0
        ? findDiscoveredPath(s.discovered, s.virtual.screenId, target)
        : findScreenPath({ adjacency, from: s.virtual.screenId, to: target, canPass: canPass(s) })?.path ?? null;
      if (path) {
        s.route = path.slice(1);
        s.phase = 'traversing';
        events.push(narrative(s, `Running ${screenLabel(s.virtual.screenId)} → ${screenLabel(target)}`));
      }
      return;
    }
    const regionRoute = takeRegionJob(s);
    if (regionRoute) {
      s.route = regionRoute;
      s.phase = 'traversing';
      events.push(narrative(s, `Running ${screenLabel(s.virtual.screenId)} → ${screenLabel(regionRoute[regionRoute.length - 1])} (new region)`));
      return;
    }
    // Exhausted but progress this epoch: one more pass (resetFrontier prevents looping).
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
    const from = s.virtual.screenId; // discovered mode: the hop must be a flood-detected exit
    const next = s.route.shift()!;
    const discoveredExit = s.discovered.size > 0
      ? discoveredExitFor(s.discovered, from, next, s.route.length === 0 ? s.pendingEdgeSig : null)
      : undefined;
    const edge = s.discovered.size > 0 ? undefined : (adjacency.get(from) ?? []).find(e => e.to === next && canPass(s)(e));
    if (!discoveredExit && !edge) {
      s.route = [];
      s.phase = 'observing';
      events.push(debug(s, `route aborted: no passable edge ${from} → ${next}`));
      return;
    }
    if (edge) spendKeysForEdge(s, edge);
    // Pass-through over explored ground: one BACKTRACK line, no re-observe. (An unlock
    // clears `visited`; a landing OUTSIDE the explored region is a fresh visit instead.)
    const tile = landingTile(discoveredExit, edge);
    if (s.route.length > 0 && s.visited.has(next) && regionCovered(s.regionReach, next, tile)) {
      s.virtual = { screenId: next, tile };
      events.push(narrative(s, `Backtrack through ${screenLabel(next)} entering at ${tile.col},${tile.row}`));
      return; // phase stays 'traversing'
    }
    emitHop(s, events, next, discoveredExit, edge);
    if (s.route.length === 0) s.pendingEdgeSig = null;
    s.phase = 'observing'; // observe the destination so its targets get triggered
  };

  const trigger = (s: EngineState, obs: SimObservation, events: SimEvent[], actions: TriggerAction[]): void => {
    const target = s.currentTarget;
    if (!target) { s.phase = 'observing'; return; }
    // A trap-marked target slams the shutters shut behind the player first (its own
    // trigger/verify cycle); the real target re-runs right after.
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
export type { EngineDeps, StepResult };
