/* @layer renderer-lib @kind logic */
/**
 * Haptic Bridge — connects C game events to the haptic service and controller vibration.
 *
 * Uses a vibration mixer to coalesce overlapping events into a single active
 * envelope. This prevents flooding the HID worker (which opens/writes/closes
 * the device synchronously per request).
 *
 * Merge strategy:
 *  - Motor OFF + new event → send immediately
 *  - Motor ON + stronger event → interrupt with new pattern
 *  - Motor ON + same/weaker event → extend active duration (motor already running)
 */

import { handleHapticEvent, setVibrateFunction, updateHapticSettings } from '@shared/input/haptics';
import type { HapticSettings } from '@shared/input/haptics';
import type { VibrationSegment } from '@shared/input/base';
import { webHidReader } from './hid-reader';

let initialized = false;

// ─── Vibration Mixer State ───

/** Timestamp (performance.now) when the current vibration is expected to end */
let activeUntil = 0;
/** Peak intensity of the currently playing vibration */
let activeIntensity = 0;
/** Timer to reset state after vibration expires (for bookkeeping) */
let decayTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Debug Counters ───
let debugEventCount = 0;
let debugDispatchCount = 0;
let debugMergedCount = 0;
let debugCHookCount = 0;
let debugLogTimer: ReturnType<typeof setInterval> | null = null;

const startDebugLog = (): void => {
  if (debugLogTimer) return;
  debugLogTimer = setInterval(() => {
    if (debugCHookCount === 0 && debugEventCount === 0) return;
    console.log(`[Haptic] C-hooks=${debugCHookCount} service=${debugEventCount} dispatched=${debugDispatchCount} merged=${debugMergedCount}`);
    debugCHookCount = 0;
    debugEventCount = 0;
    debugDispatchCount = 0;
    debugMergedCount = 0;
  }, 1000);
};

const dispatchVibration = (pattern: VibrationSegment[], gapMs?: number): void => {
  const now = performance.now();
  debugEventCount++;

  // Compute peak intensity and total duration from the incoming pattern
  let peakIntensity = 0;
  let totalDuration = 0;
  for (const seg of pattern) {
    if (seg.intensity > peakIntensity) peakIntensity = seg.intensity;
    totalDuration += seg.durationMs;
  }
  if (gapMs && pattern.length > 1) totalDuration += gapMs * (pattern.length - 1);

  // Add overhead estimate for HID worker (open device + frame writes + close)
  const workerOverheadMs = 20;
  const effectiveDuration = totalDuration + workerOverheadMs;

  const motorOff = now >= activeUntil;
  const stronger = peakIntensity > activeIntensity;

  if (motorOff || stronger) {
    debugDispatchCount++;
    sendToController(pattern, gapMs);
    activeIntensity = peakIntensity;
    activeUntil = now + effectiveDuration;
    scheduleDecay(effectiveDuration);
  } else {
    // Motor already vibrating at this intensity — drop to prevent queue buildup
    debugMergedCount++;
  }
};

const sendToController = (pattern: VibrationSegment[], gapMs?: number): void => {
  const keys = webHidReader.getConnectedDeviceKeys();
  if (keys.length === 0) return;
  window.api.vibratePattern(keys[0], pattern, gapMs ?? 0);
};

const scheduleDecay = (ms: number): void => {
  if (decayTimer !== null) clearTimeout(decayTimer);
  decayTimer = setTimeout(() => {
    activeIntensity = 0;
    activeUntil = 0;
    decayTimer = null;
  }, ms);
};

// ─── Bridge Lifecycle ───

const initHapticBridge = (settings: HapticSettings): void => {
  if (initialized) return;
  initialized = true;

  if (window.api?.isDev) startDebugLog();
  setVibrateFunction(dispatchVibration);
  updateHapticSettings(settings);

  (window as any).__onHapticEvent = (eventType: number, param: number) => {
    debugCHookCount++;
    handleHapticEvent(eventType, param);
  };
};

const updateHapticBridgeSettings = (settings: HapticSettings): void => {
  updateHapticSettings(settings);
};

const destroyHapticBridge = (): void => {
  (window as any).__onHapticEvent = null;
  setVibrateFunction(null);
  if (decayTimer !== null) clearTimeout(decayTimer);
  if (debugLogTimer !== null) clearInterval(debugLogTimer);
  debugLogTimer = null;
  activeIntensity = 0;
  activeUntil = 0;
  initialized = false;
};

export {
  destroyHapticBridge,
  initHapticBridge,
  updateHapticBridgeSettings
};
