/* @layer bridge-wasm @kind logic */
import { trackerReading } from './tracker-reading';
import type { CheckId } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';

const computeTrackerSnapshot = (
  ...args: Parameters<typeof trackerReading>
): Map<CheckId, CheckStatus> => trackerReading(...args).statuses;

export { computeTrackerSnapshot };
