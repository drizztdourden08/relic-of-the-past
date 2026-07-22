/* @layer shared-game @kind logic */
/**
 * The pure step state machine. Each call advances one phase:
 *   observing → planning → traversing → triggering → verifying → observing …
 * A step never mutates its input; it returns the trigger actions to execute,
 * the events emitted, and the next state.
 */
import type { SimObservation, SimEvent, TriggerAction, DetectedCheck } from '../types';
import { ITEM_ID_TO_NAME } from '../../items/id-map';
import type { Adjacency, ScreenEdge } from './traversal';
import { buildAdjacency, findScreenPath, reachableFrom } from './traversal';
import { requirementsMet } from '../requirements-map';
import { buildReachContext, syncReachTokens, onCheckVerified, resetFrontier } from './explorer';
import { evaluateOutcome, goalCheckDone, allChecksDone } from './goal';
import { diffSnapshots, cloneSnapshot, emptySnapshot } from '../detect/flag-snapshot';
import { matchDiffs } from '../detect/check-matcher';
import { floodCurrent, discoverTargets } from './discover';
import { narrative, debug, spendKeysForEdge, entryTileFor } from './step-helpers';
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

const createEngine = (deps: EngineDeps = {}) => {
  const adjacency = deps.adjacency ?? buildAdjacency();
  const totalChecks = deps.totalChecks;
  const canPass = (s: EngineState) => (edge: ScreenEdge): boolean => requirementsMet(edge.requirements, buildReachContext(s));

  const observe = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
    s.inventory = new Set(obs.inventory);
    syncReachTokens(s);
    // The runner reports the REAL location; only adopt its tile when it matches
    // the screen the virtual Link is on, else keep the tile set at traversal time.
    const tile = obs.virtual.screenId === s.virtual.screenId ? obs.virtual.tile : s.virtual.tile;
    s.virtual = { screenId: s.virtual.screenId, tile };
    s.visited.add(s.virtual.screenId);

    const flood = floodCurrent(s, obs);
    for (const target of discoverTargets(s, obs, flood)) {
      if (!s.pending.some(t => t.key === target.key)) {
        s.pending.push(target);
        events.push(debug(s, `discovered ${target.label}`));
      }
    }

    const reachable = reachableFrom(adjacency, s.virtual.screenId, canPass(s));
    for (const id of reachable) s.reachedScreens.add(id);
    s.frontier = [...reachable].filter(id => id !== s.virtual.screenId && !s.visited.has(id));
    s.phase = 'planning';
  };

  const plan = (s: EngineState, events: SimEvent[]): void => {
    const outcome = evaluateOutcome(s, totalChecks);
    if (outcome) {
      s.outcome = outcome;
      s.phase = 'done';
      events.push(narrative(s, `Run finished: ${outcome}`));
      return;
    }
    if (s.pending.length > 0) {
      s.currentTarget = s.pending.shift();
      s.phase = 'triggering';
      return;
    }
    if (s.route.length > 0) {
      s.phase = 'traversing';
      return;
    }
    if (s.frontier.length > 0) {
      const target = s.frontier.shift()!;
      const route = findScreenPath({ adjacency, from: s.virtual.screenId, to: target, canPass: canPass(s) });
      if (route) {
        s.route = route.path.slice(1);
        s.phase = 'traversing';
        events.push(narrative(s, `Running ${s.virtual.screenId} → ${target}`));
      }
      return;
    }
    // Frontier + pending exhausted but a check completed this epoch: do one more
    // epoch pass (resetFrontier clears progressSinceEpoch, so this can't loop).
    if (s.progressSinceEpoch) {
      resetFrontier(s);
      s.phase = 'observing';
      events.push(debug(s, `epoch ${s.epoch}: re-exploring after progress`));
      return;
    }
    s.outcome = goalCheckDone(s) || allChecksDone(s, totalChecks) ? 'completed' : 'not-completable';
    s.phase = 'done';
    events.push(narrative(s, `Run finished: ${s.outcome}`));
  };

  const traverse = (s: EngineState, events: SimEvent[]): void => {
    if (s.route.length === 0) {
      s.phase = 'observing';
      return;
    }
    const from = s.virtual.screenId;
    const next = s.route.shift()!;
    const edge = (adjacency.get(from) ?? []).find(e => e.to === next && canPass(s)(e));
    if (!edge) {
      s.route = [];
      s.phase = 'observing';
      events.push(debug(s, `route aborted: no passable edge ${from} → ${next}`));
      return;
    }
    spendKeysForEdge(s, edge);
    s.virtual = { screenId: next, tile: entryTileFor(edge) };
    events.push(debug(s, `→ ${next}`));
    // Observe every screen along the route so its targets get discovered/triggered.
    s.phase = 'observing';
  };

  const trigger = (s: EngineState, obs: SimObservation, events: SimEvent[], actions: TriggerAction[]): void => {
    const target = s.currentTarget;
    if (!target) {
      s.phase = 'observing';
      return;
    }
    s.preTrigger = cloneSnapshot(obs.flags);
    actions.push(target.action);
    events.push(narrative(s, `Triggering ${target.label}`));
    s.phase = 'verifying';
  };

  const verify = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
    const diffs = diffSnapshots(s.preTrigger ?? emptySnapshot(), obs.flags);
    const target = s.currentTarget;

    // A trigger that changed no flag did nothing observable — don't mark it done.
    // Record it as failed so discovery skips it this epoch; a future epoch retries.
    if (diffs.length === 0) {
      if (target) {
        s.failed.add(target.key);
        events.push(debug(s, `trigger produced no flag change: ${target.label}`));
      }
      s.currentTarget = undefined;
      s.preTrigger = undefined;
      s.phase = 'observing';
      return;
    }

    const { name, matched } = matchDiffs(diffs);
    const itemReceived = obs.itemReceived !== undefined ? ITEM_ID_TO_NAME[obs.itemReceived] : undefined;
    const epochBefore = s.epoch;
    const detected: DetectedCheck = { evidence: diffs, matched, matchedName: name, itemReceived, at: s.virtual };

    if (target) s.done.add(target.key);
    onCheckVerified(s, detected);

    const stopId = s.config.stopAtCheckId;
    if (stopId && (matched?.id === stopId || name === stopId)) s.stopHit = true;

    if (itemReceived) events.push(narrative(s, `Got "${itemReceived}"`));
    events.push({ ...narrative(s, `Verified ${name}`), data: { detected } });
    if (s.epoch > epochBefore) events.push(narrative(s, `Unlock! re-flooding from ${s.virtual.screenId}`));

    s.currentTarget = undefined;
    s.preTrigger = undefined;
    s.phase = 'observing';
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
    else if (s.phase === 'verifying') verify(s, obs, events);

    return { actions, events, nextState: s };
  };

  return { step };
};

export { createEngine };
export type { EngineDeps, StepResult };
