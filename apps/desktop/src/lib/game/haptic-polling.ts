/**
 * Haptic Polling — frame-by-frame detection of game state changes for haptics.
 *
 * Runs inside the existing rAF loop (ui-bridge) and detects:
 * - Dash state → periodic pulse vibrations
 * - State transitions (falling, landing, death, etc.)
 * - Spin attack release
 * - Health decreases (backup detection if C hook misses)
 */

import {
  handleDashPulse,
  handleDeath,
  handleEnvironmental,
  handleSpinAttack,
  resetDashState,
} from '@shared/input/haptics';
import { EnvironmentalEvent } from '@shared/input/haptics';

// Player handler states from player.h
const kPlayerState_Ground = 0;
const kPlayerState_FallingIntoHole = 1;
const kPlayerState_SpinAttack = 3;
const kPlayerState_Swimming = 4;
const kPlayerState_StartDash = 17;
const kPlayerState_CrossingWorlds = 20;
const kPlayerState_FallOfLeftRightLedge = 12;
const kPlayerState_JumpOffLedgeDiag = 14;
const kPlayerState_HopSouth = 11;

// Previous frame state
let prevHandlerState = 0;
let prevIsRunning = 0;
let prevMainModule = 0;
let wasDashing = false;

/**
 * Called every frame from the rAF loop with the raw UI state buffer.
 * Bytes 115-118 are the player action state data we added.
 */
function pollHapticState(heap: Uint8Array, ptr: number): void {
  const mainModule = heap[ptr + 0];
  const handlerState = heap[ptr + 115];
  const isRunning = heap[ptr + 116];
  const dashCtr = heap[ptr + 117];

  // ─── Dash vibration ───
  // Link is actively dashing when isRunning=1 and dashCtr < 64 (charging complete)
  const isDashing = isRunning !== 0 && dashCtr < 64 && dashCtr >= 32;

  if (isDashing) {
    handleDashPulse();
    wasDashing = true;
  } else if (wasDashing) {
    resetDashState();
    wasDashing = false;
  }

  // ─── State transition detection ───
  if (handlerState !== prevHandlerState) {
    // Falling into pit
    if (handlerState === kPlayerState_FallingIntoHole && prevHandlerState !== kPlayerState_FallingIntoHole) {
      handleEnvironmental(EnvironmentalEvent.FALL_INTO_PIT);
    }

    // Landing from ledge jump (transitioning from jump states back to ground)
    if (handlerState === kPlayerState_Ground &&
      (prevHandlerState === kPlayerState_FallOfLeftRightLedge ||
       prevHandlerState === kPlayerState_JumpOffLedgeDiag ||
       prevHandlerState === kPlayerState_HopSouth)) {
      handleEnvironmental(EnvironmentalEvent.LAND_FROM_LEDGE);
    }

    // Spin attack release (state 3 = spin attack active)
    if (handlerState === kPlayerState_SpinAttack && prevHandlerState !== kPlayerState_SpinAttack) {
      handleSpinAttack();
    }

    // Entering water
    if (handlerState === kPlayerState_Swimming && prevHandlerState !== kPlayerState_Swimming) {
      handleEnvironmental(EnvironmentalEvent.ENTER_WATER);
    }

    // Mirror warp
    if (handlerState === kPlayerState_CrossingWorlds && prevHandlerState !== kPlayerState_CrossingWorlds) {
      handleEnvironmental(EnvironmentalEvent.MIRROR_WARP);
    }
  }

  // ─── Death detection (module 18 = game over) ───
  if (mainModule === 18 && prevMainModule !== 18) {
    handleDeath();
  }

  // Update previous frame state
  prevHandlerState = handlerState;
  prevIsRunning = isRunning;
  prevMainModule = mainModule;
}

/** Reset polling state (call on game stop/restart) */
function resetHapticPolling(): void {
  prevHandlerState = 0;
  prevIsRunning = 0;
  prevMainModule = 0;
  wasDashing = false;
  resetDashState();
}

export { pollHapticState, resetHapticPolling };
