/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@shared/game/data';
import { voidCall } from '../bridge/wasm-call';
import { detectionOf } from '../randomizer-client/check-detection';
import type { MarkPlan } from './cheat-check-mark.type';
import { NO_ITEM_SENTINEL } from './cheat-check-mark.constants';
import { numArgs } from '../num-args';
import { progressMarkPlan } from './progress-mark-plan';

const markChestCollected = (roomId: number, chestIndex: number): void =>
  voidCall('WasmCheatTriggerCheck', numArgs(roomId, chestIndex, NO_ITEM_SENTINEL));

const markOverworldEvent = (owScreen: number, mask: number): void =>
  voidCall('WasmTriggerOverworldCheck', numArgs(owScreen, mask, NO_ITEM_SENTINEL));

const markPlanOf = (check: CheckRecord): MarkPlan => {
  const detection = detectionOf(check.id);
  if (detection === null) return { refusal: 'the record carries no detection to write back' };
  if (detection.mode === 'room-mask') {
    const { roomId, chestIndex } = check.gameId;
    if (roomId === undefined || chestIndex === undefined) {
      return { refusal: 'its room flag is not a chest slot the console can open' };
    }
    return { write: () => markChestCollected(roomId, chestIndex) };
  }
  if (detection.mode === 'ow-mask') {
    const { owScreen, mask } = detection;
    return { write: () => markOverworldEvent(owScreen, mask) };
  }
  if (detection.mask === undefined) {
    return { refusal: 'its completion is a counter, which the console will not fake' };
  }
  return progressMarkPlan(check, detection.bufferIndex);
};

export { markPlanOf };
