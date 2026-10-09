/* @layer bridge-wasm @kind logic */
import { handleDashPulse, handleDeath, resetDashState } from '@rotp/input-mapping';
import { DASH_CHARGED_BELOW, DASH_CHARGED_FROM, GAME_OVER_MODULE, UI_STATE_OFFSET } from './haptic-polling.constants';
import { onHandlerStateChange } from './on-handler-state-change';
import { pollingState } from './polling-state';
import { readU8 } from "../bridge/wasm-call";

const pollHapticState = (heap: Uint8Array, ptr: number): void => {
  const mainModule = readU8(heap, ptr + UI_STATE_OFFSET.mainModule);
  const handlerState = readU8(heap, ptr + UI_STATE_OFFSET.handlerState);
  const isRunning = readU8(heap, ptr + UI_STATE_OFFSET.isRunning);
  const dashCtr = readU8(heap, ptr + UI_STATE_OFFSET.dashCounter);

  const isDashing = isRunning !== 0 && dashCtr < DASH_CHARGED_BELOW && dashCtr >= DASH_CHARGED_FROM;

  if (isDashing) {
    handleDashPulse();
    pollingState.wasDashing = true;
  } else if (pollingState.wasDashing) {
    resetDashState();
    pollingState.wasDashing = false;
  }

  if (handlerState !== pollingState.prevHandlerState) {
    onHandlerStateChange(handlerState, pollingState.prevHandlerState);
  }

  if (mainModule === GAME_OVER_MODULE && pollingState.prevMainModule !== GAME_OVER_MODULE) {
    handleDeath();
  }

  pollingState.prevHandlerState = handlerState;
  pollingState.prevMainModule = mainModule;
};

export { pollHapticState };
