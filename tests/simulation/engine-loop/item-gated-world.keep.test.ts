/* @layer tests @kind test */
import { it, expect, afterAll } from 'vitest';
import type { SimEvent, DetectedCheck } from '../../../shared/game/simulation/types';
import { createEngine } from '../../../shared/game/simulation/engine/engine';
import { createEngineState } from '../../../shared/game/simulation/engine/state';
import { buildAdjacency } from '../../../shared/game/simulation/engine/traversal';
import { unregisterRecord } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import {
  BOMBS_ID, CONNECTION_IDS, HAMMER_ID, HOUSE_CHECK, KAKARIKO_TAVERN_ROOM, LAMP_ID, LINKS_HOUSE_ROOM, STEP_LIMIT,
  TAVERN_CHECK,
} from './engine-loop.constants';
import { FakeWorld } from './fake-world';
import { makeConnections } from './make-connections';
import { runLoop } from './run-loop';

const worldWithTavernItem = (tavernItemId: number): FakeWorld => new FakeWorld([
  { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: tavernItemId },
  { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
]);

describeDataset('simulation engine loop', () => {
  afterAll(() => {
    for (const id of CONNECTION_IDS) unregisterRecord('connection', id);
  });

  it('clears an item-gated world end-to-end and reports completed at the goal check', () => {
    const world = worldWithTavernItem(HAMMER_ID);
    const { state, events } = runLoop(world, makeConnections(true), HOUSE_CHECK);

    expect(state.phase).toBe('done');
    expect(state.outcome).toBe('completed');
    expect(state.completedChecks.has(TAVERN_CHECK)).toBe(true);
    expect(state.completedChecks.has(HOUSE_CHECK)).toBe(true);
    expect(state.epoch).toBeGreaterThanOrEqual(1);
    expect(events.some(m => m.startsWith('Reset:'))).toBe(true);
  });

  it('re-floods from the current position after a traversal-affecting unlock', () => {
    const world = worldWithTavernItem(HAMMER_ID);
    const { state } = runLoop(world, makeConnections(true), HOUSE_CHECK);
    expect(state.reachedScreens.has('C')).toBe(true);
    expect(state.visited.has('C')).toBe(true);
  });

  it('reports not-completable when the frontier exhausts with the goal still gated', () => {
    const world = worldWithTavernItem(BOMBS_ID);
    const { state } = runLoop(world, makeConnections(true), HOUSE_CHECK);

    expect(state.phase).toBe('done');
    expect(state.outcome).toBe('not-completable');
    expect(state.reachedScreens.has('C')).toBe(false);
    expect(state.completedChecks.has(TAVERN_CHECK)).toBe(true);
  });

  it('stops exactly at a configured stop-at-check', () => {
    const world = worldWithTavernItem(HAMMER_ID);
    const engine = createEngine({ adjacency: buildAdjacency(makeConnections(true)) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { stopAtCheckId: TAVERN_CHECK });
    for (let i = 0; i < STEP_LIMIT && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, nextState } = engine.step(state, obs);
      for (const a of actions) world.apply(a);
      state = nextState;
    }
    expect(state.outcome).toBe('stopped-at-check');
    expect(state.completedChecks.has(HOUSE_CHECK)).toBe(false);
  });

  it('attaches the DetectedCheck to the "Verified ..." event as its data payload', () => {
    const world = worldWithTavernItem(HAMMER_ID);
    const engine = createEngine({ adjacency: buildAdjacency(makeConnections(true)) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId: HOUSE_CHECK });
    const events: SimEvent[] = [];
    for (let i = 0; i < STEP_LIMIT && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, events: evs, nextState } = engine.step(state, obs);
      for (const a of actions) world.apply(a);
      events.push(...evs);
      state = nextState;
    }

    const verified = events.find(e => e.msg === 'Verified Kakariko Tavern');
    const detected = (verified?.data as { detected?: DetectedCheck } | undefined)?.detected;
    expect(detected?.checkId).toBe(TAVERN_CHECK);
  });
});
