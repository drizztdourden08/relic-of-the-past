/* @layer tests @kind helper */
import type { ConnectionRecord, CheckId } from '@rotp/game-data';
import { createEngine, createEngineState, buildAdjacency } from '@rotp/navigation';
import { STEP_LIMIT } from './engine-loop.constants';
import type { FakeWorld } from './fake-world';

const runLoop = (world: FakeWorld, connections: ConnectionRecord[], goalCheckId?: CheckId) => {
  const engine = createEngine({ adjacency: buildAdjacency(connections) });
  let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId });
  const events: string[] = [];
  for (let i = 0; i < STEP_LIMIT && state.phase !== 'done'; i++) {
    const obs = world.observe(state);
    const { actions, events: evs, nextState } = engine.step(state, obs);
    for (const a of actions) world.apply(a);
    for (const e of evs) events.push(e.msg);
    state = nextState;
  }
  return { state, events };
};

export { runLoop };
