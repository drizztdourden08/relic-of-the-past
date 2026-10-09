/* @layer shared-game @kind logic */
import { RECORDED_ACTS } from './event-gates.constants';
import type { ActToken } from '../event-gate.type';

const actTokensOf = (completedCheckIds: Iterable<string>): Set<ActToken> => {
  const done = completedCheckIds instanceof Set ? completedCheckIds : new Set(completedCheckIds);
  return new Set(RECORDED_ACTS.filter((checkId) => done.has(checkId)));
};

export { actTokensOf };
