/* @layer bridge-wasm @kind logic */
import type { ApClientPacket } from '../ap-protocol.type';
import { CLIENT_GOAL } from './online-goal.constants';
import type { GoalReporter } from './online-goal.type';

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

export { createGoalReporter };
