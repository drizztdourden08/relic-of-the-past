/* @layer bridge-wasm @kind logic */
import type { EngineState, SimObservation } from '@shared/game/simulation';
import { describeScreen } from './describe-screen';
import type { VisitLog } from './drive.type';

const countReached = (grid?: boolean[][]): number =>
  grid ? grid.reduce((n, row) => n + row.reduce((m, v) => m + (v ? 1 : 0), 0), 0) : 0;

const visitOf = (state: EngineState, obs: SimObservation): VisitLog => ({
  ...describeScreen(state.virtual.screenId),
  tile: state.virtual.tile,
  epoch: state.epoch,
  reached: countReached(obs.reached),
  exits: (obs.exits ?? []).map((e) => ({ to: e.to, ...(e.steps == null ? {} : { steps: e.steps }), ...(e.origin ? { origin: e.origin } : {}) })),
});

export { visitOf };
