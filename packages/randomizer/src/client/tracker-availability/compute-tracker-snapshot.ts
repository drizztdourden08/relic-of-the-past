/* @layer bridge-wasm @kind logic */
import { trackerReading } from './tracker-reading';
import type { CheckId, CheckStatus } from '@rotp/game-data';

const computeTrackerSnapshot = (
  ...args: Parameters<typeof trackerReading>
): Map<CheckId, CheckStatus> => trackerReading(...args).statuses;

export { computeTrackerSnapshot };
