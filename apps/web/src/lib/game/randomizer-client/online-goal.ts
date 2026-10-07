/* @layer bridge-wasm @kind logic */
/**
 * The run's goal to the server: `StatusUpdate` with CLIENT_GOAL once the final fight is won.
 * The goal is the ledger's "Ganon beaten" event (the location completion.data.ts writes the goal
 * rules for), polled like any other row but never a server location. The ledger bit is written
 * the frame Ganon's death finishes, so the goal fires exactly when the run is won. Sent once,
 * and sent again on a reconnect, since the server may never have seen the first and a repeat
 * changes nothing.
 */
import type { CheckId } from '@shared/game/data/types/ids';
import type { ApClientPacket } from './ap-protocol.type';

/** Ganon beaten (goal.ts in the simulator names the same row). */
const GOAL_CHECK: CheckId = 'check-351';

const CLIENT_GOAL = 30;

interface GoalReporter {
  readonly reached: boolean;
  /** The goal fired locally; sends at most once per connection. */
  report(): void;
  /** A fresh connection: re-sends when the goal was already reached. */
  onConnected(): void;
}

const createGoalReporter = (send: (packet: ApClientPacket) => void): GoalReporter => {
  let reached = false;
  const sendGoal = (): void => send({ cmd: 'StatusUpdate', status: CLIENT_GOAL });
  return {
    get reached() { return reached; },
    report() {
      if (reached) return;
      reached = true;
      sendGoal();
    },
    onConnected() {
      if (reached) sendGoal();
    },
  };
};

export { CLIENT_GOAL, createGoalReporter, GOAL_CHECK };
export type { GoalReporter };
