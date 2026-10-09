/* @layer bridge-wasm @kind logic */
import { getCheck } from '@shared/game/data';
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { CheckDetection } from './check-detection.type';
import { detectionOfGameId } from './detection-of-game-id';

const detectionOf = (checkId: string): CheckDetection | null => {
  let check: CheckRecord;
  try {
    check = getCheck(checkId as CheckId);
  } catch {
    return null;
  }
  return detectionOfGameId(check.gameId);
};

export { detectionOf };
