/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { ConnectionRecord } from '@rotp/game-data';
import { createEngine, createEngineState, buildAdjacency, resetFrontier, discoverTargets, emptySnapshot } from '@rotp/navigation';
import type { SimTarget } from '@rotp/navigation';
import { describeDataset } from '../../dataset-guard';
import { FakeWorld } from '../engine-loop/fake-world';
import {
  BOMBS_ID, CHICKEN_HOUSE_ROOM, HOUSE_CHECK, KAKARIKO_TAVERN_ROOM, LAMP_ID, LINKS_HOUSE_ROOM, STEP_LIMIT,
} from './engine-review-fixes.constants';
import { baseObs } from './base-obs';
import { trackConnectionPairs } from './track-connection-pairs';

const registerPair = trackConnectionPairs();

const CHAIN: ConnectionRecord[] = [
  registerPair({ fromId: 'connection-t01', from: 'A', toId: 'connection-t01r', to: 'B' }),
  registerPair({ fromId: 'connection-t02', from: 'B', toId: 'connection-t02r', to: 'C' }),
];

const target: SimTarget = {
  screenId: 'A',
  roomId: KAKARIKO_TAVERN_ROOM,
  action: { type: 'chest', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, itemId: BOMBS_ID },
  key: `chest:${KAKARIKO_TAVERN_ROOM}:0`,
  role: 'check',
  label: 'chest (test)',
  noun: 'chest',
  verb: 'Opening',
};

describeDataset('resetFrontier and its epoch reset semantics', () => {
  it('clears visited and failed so everything is re-explored from here', () => {
    const s = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});
    s.visited = new Set(['A', 'B', 'C']);
    s.failed = new Set(['chest:0x1:0']);
    s.frontier = ['B'];
    s.progressSinceEpoch = true;

    resetFrontier(s);

    expect(s.epoch).toBe(1);
    expect(s.visited.size).toBe(0);
    expect(s.failed.size).toBe(0);
    expect(s.frontier).toHaveLength(0);
    expect(s.progressSinceEpoch).toBe(false);
  });
});

describeDataset('engine backtracks visited pass-through screens instead of re-exploring them', () => {
  it('routes through an already-visited screen with one Backtrack event and no re-discovery', () => {
    const world = new FakeWorld([
      { screenId: 'B', roomId: CHICKEN_HOUSE_ROOM, chestIndex: 0, isBig: false, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: BOMBS_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, isBig: false, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const engine = createEngine({ adjacency: buildAdjacency(CHAIN) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId: HOUSE_CHECK });
    state.visited.add('B');

    const events: string[] = [];
    for (let i = 0; i < STEP_LIMIT && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, events: stepEvents, nextState } = engine.step(state, obs);
      for (const e of stepEvents) events.push(e.msg);
      for (const a of actions) world.apply(a);
      state = nextState;
    }

    expect(state.phase).toBe('done');
    expect(state.completedChecks.has(HOUSE_CHECK)).toBe(true);
    expect(events.some(m => m.startsWith('Backtrack through B'))).toBe(true);
    expect(state.done.has(`chest:${CHICKEN_HOUSE_ROOM}:0`)).toBe(false);
  });
});

describeDataset('engine traverse never teleports through a blocked edge', () => {
  it('aborts the route when the next hop has no passable edge', () => {
    const conns: ConnectionRecord[] = [
      registerPair({
        fromId: 'connection-t03', from: 'A', toId: 'connection-t03r', to: 'C',
        nav: { transitType: 'door', requirements: [['hammer']], weight: 1 },
      }),
    ];
    const engine = createEngine({ adjacency: buildAdjacency(conns) });
    const state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});
    state.phase = 'traversing';
    state.route = ['C'];

    const { events, nextState } = engine.step(state, baseObs('A', emptySnapshot()));

    expect(nextState.virtual.screenId).toBe('A');
    expect(nextState.route).toHaveLength(0);
    expect(nextState.phase).toBe('observing');
    expect(events.some(e => e.msg.includes('route aborted'))).toBe(true);
  });
});

describeDataset('engine handling of a failed trigger', () => {
  it('records a no-flag-change trigger as failed instead of done, then retries after an epoch reset', () => {
    const engine = createEngine({ adjacency: buildAdjacency(CHAIN) });
    const state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});
    state.phase = 'verifying';
    state.currentTarget = { ...target };
    state.preTrigger = emptySnapshot();

    const { nextState } = engine.step(state, baseObs('A', emptySnapshot()));

    expect(nextState.failed.has(target.key)).toBe(true);
    expect(nextState.done.has(target.key)).toBe(false);

    const obsWithChest = baseObs('A', emptySnapshot());
    obsWithChest.interactables = {
      chests: [{ roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, isBig: false, tile: { row: 0, col: 0 }, posKnown: true, opened: false, itemId: BOMBS_ID }],
      sprites: [],
      doors: [],
    };
    expect(discoverTargets(nextState, obsWithChest, undefined)).toHaveLength(0);

    resetFrontier(nextState);
    expect(discoverTargets(nextState, obsWithChest, undefined)).toHaveLength(1);
  });
});
