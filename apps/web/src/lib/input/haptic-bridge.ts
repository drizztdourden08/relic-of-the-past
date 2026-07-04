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
import { findController, findControllerById } from '@shared/input/register-all';
import { parseGamepadId } from '@shared/input';
import type { BaseController } from '@shared/input/base';
import { getPlatform } from '@app/platform/get-platform';
import { webHidReader } from './hid-reader';
import { vibrateGamepadPattern } from './vibration';
import { peekInputManager } from './input-manager';
import * as controllersStore from './controllers-store';

let initialized = false;

// ─── Per-device haptics gate ───
// Keyed by "vid:pid"; a key set to false mutes that device. Absent = enabled
// (the supportsVibration() check still applies). Configured in the DEVICES panel.
let hapticDevices: Record<string, boolean> = {};
const deviceHapticsEnabled = (deviceKey: string): boolean => hapticDevices[deviceKey] !== false;

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
    // Device haptics (mobile phone buzz); no-op on desktop, where controllers rumble.
    getPlatform().device.vibrate(totalDuration);
    activeIntensity = peakIntensity;
    activeUntil = now + effectiveDuration;
    scheduleDecay(effectiveDuration);
  } else {
    // Motor already vibrating at this intensity — drop to prevent queue buildup
    debugMergedCount++;
  }
};

// Xbox/XInput pads surface on both the Gamepad API and node-hid buses; mirror the
// polling-engine's id match so the same physical pad isn't buzzed twice.
const isGamepadServedByHid = (gp: Gamepad, hidKeys: Set<string>): boolean => {
  const id = gp.id.toLowerCase();
  for (const key of hidKeys) {
    const [vid, pid] = key.split(':');
    if (id.includes(`vendor: ${vid}`) && id.includes(`product: ${pid}`)) return true;
  }
  return false;
};

// Resolve the controller behind a Gamepad-API pad so its per-pad strength shaping applies.
// Xbox/XInput rarely embeds vid/pid in the id, so fall back to the family keyword.
const resolveGamepadController = (gp: Gamepad): BaseController | null => {
  const parsed = parseGamepadId(gp.id);
  if (parsed && parsed.vid !== '0000') {
    const byId = findController(parsed.vid, parsed.pid);
    if (byId) return byId;
  }
  const id = gp.id.toLowerCase();
  if (id.includes('xbox') || id.includes('xinput')) return findControllerById('xbox');
  return null;
};

// Apply a controller's strength curve to each segment. Magnitude only — durations are kept
// exactly as authored, so a pad can hit harder without any event lasting longer.
const shapeForController = (ctrl: BaseController | null, pattern: VibrationSegment[]): VibrationSegment[] => {
  if (!ctrl) return pattern;
  return pattern.map(seg => ({ durationMs: seg.durationMs, intensity: ctrl.shapeVibration(seg.intensity) }));
};

const sendToController = (pattern: VibrationSegment[], gapMs?: number): void => {
  const gap = gapMs ?? 0;

  // HID controllers (Switch Pro, PlayStation, 8BitDo) via the node-hid worker. Only
  // dispatch to pads that actually rumble — writing haptic frames to a non-vibrating
  // pad still pauses its HID read stream, which stalls input.
  const hidKeys = webHidReader.getConnectedDeviceKeys();
  for (const key of hidKeys) {
    if (!deviceHapticsEnabled(key)) continue;
    const [vid, pid] = key.split(':');
    const ctrl = findController(vid, pid);
    if (ctrl?.supportsVibration()) {
      controllersStore.vibratePattern(key, shapeForController(ctrl, pattern), gap);
    }
  }

  // Gamepad API controllers (Xbox/XInput) rumble through the vibrationActuator, never
  // node-hid — so they never show up in hidKeys above. Skip any pad already served
  // over HID to avoid a double buzz.
  const hidSet = new Set(hidKeys);
  const gamepadVidPid = peekInputManager()?.gamepadVidPid;
  for (const gp of navigator.getGamepads()) {
    if (!gp || !gp.connected || isGamepadServedByHid(gp, hidSet)) continue;
    if (!(gp as { vibrationActuator?: { playEffect?: unknown } }).vibrationActuator?.playEffect) continue;
    const vp = gamepadVidPid?.get(gp.index);
    if (vp && !deviceHapticsEnabled(`${vp.vid}:${vp.pid}`)) continue;
    vibrateGamepadPattern(gp.index, shapeForController(resolveGamepadController(gp), pattern), gap);
  }
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

const updateHapticDevices = (map: Record<string, boolean> | undefined): void => {
  hapticDevices = map ?? {};
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
  updateHapticBridgeSettings,
  updateHapticDevices
};
