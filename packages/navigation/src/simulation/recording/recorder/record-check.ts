/* @layer shared-game @kind logic */
import type { ObservedCheck, RecorderState } from './recorder.type';

const sameObservation = (a: ObservedCheck, b: ObservedCheck): boolean =>
  a.checkId === b.checkId && a.roomId === b.roomId && a.screenId === b.screenId;

const recordCheck = (rec: RecorderState, check: ObservedCheck): void => {
  if (!rec.checks.some(c => sameObservation(c, check))) {
    rec.checks.push(check);
  }
};

export { recordCheck };
