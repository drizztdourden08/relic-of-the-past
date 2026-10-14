/* @layer bridge-wasm @kind logic */
import type { EngineState, PathStep } from '@rotp/navigation';
import { describeScreen, recordTransition } from '@rotp/navigation';
import { captureFlood } from './capture-flood';
import type { DriveRun } from './drive-run.type';
import { itemNames } from './item-names';

const isFloodWorthCapturing = (next: EngineState, changedScreen: boolean, prevEpoch: number): boolean =>
  (changedScreen || next.epoch > prevEpoch) && next.phase !== 'traversing' && !next.stopHit && !next.outcome;

const pathStepOf = (next: EngineState, gained: string[], lost: string[]): PathStep => ({
  ...describeScreen(next.virtual.screenId),
  observed: next.phase !== 'traversing',
  ...(gained.length > 0 ? { gained } : {}),
  ...(lost.length > 0 ? { lost } : {}),
});

const trackScreenChange = (run: DriveRun, prevScreen: string, prevEpoch: number): void => {
  const next = run.state;
  const changedScreen = next.virtual.screenId !== prevScreen;
  if (changedScreen) {
    recordTransition(run.recorder, prevScreen, next.virtual.screenId);
    const inv = itemNames(next.inventory);
    const gained = inv.filter((i) => !run.prevInv.includes(i));
    const lost = run.prevInv.filter((i) => !inv.includes(i));
    run.prevInv = inv;
    run.path.push(pathStepOf(next, gained, lost));
  }
  if (isFloodWorthCapturing(next, changedScreen, prevEpoch)) captureFlood(run, next);
};

export { trackScreenChange };
