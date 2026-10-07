/* @layer renderer-lib @kind logic */
/**
 * Connects C game events to controller vibration. Overlapping events are coalesced into one
 * active envelope so the HID worker (synchronous open/write/close per request) is not flooded:
 * motor off -> send now; stronger event -> interrupt; same/weaker -> extend the duration.
 */

import { getHapticIntensityScale, handleHapticEvent, setVibrateFunction, updateHapticSettings } from '@shared/input/haptics';
import type { HapticSettings } from '@shared/input/haptics';
import type { VibrationSegment } from '@shared/input/vibration-segment.type';
import { applyVibrationShaping } from '@shared/input/family';
import { HAPTIC_PATTERNS } from '@shared/input/data/haptics';
import type { HapticPatternId } from '@shared/input/data/haptics';
import { loadRumbleStrengthCache } from '@shared/input/haptics-rumble-strength';
import { readRumbleStrength } from '@shared/storage/rumble-strength';
import type { VibrateResult } from '@shared/platform';
import { getPlatform } from '@app/platform/get-platform';
import { recallControllerSdlType } from './controller-family-cache';
import { getInputManager } from './input-manager';
import * as controllersStore from './controllers-store';

let initialized = false;

// One on/off switch for the active profile (GameSettings.hapticsEnabled). When on, targeting
// narrows to the profile's own mapped devices (InputManager.allowed.gamepadKeys), read fresh on
// every send so a profile switch or rebind applies immediately.
let hapticsProfileEnabled = true;
const deviceHapticsEnabled = (deviceKey: string): boolean =>
  hapticsProfileEnabled && getInputManager().allowed.gamepadKeys.has(deviceKey);


/** Timestamp (performance.now) when the current vibration is expected to end */
let activeUntil = 0;
/** Peak intensity of the currently playing vibration */
let activeIntensity = 0;
/** Timer to reset state after vibration expires (for bookkeeping) */
let decayTimer: ReturnType<typeof setTimeout> | null = null;

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

const dispatchVibration = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean): void => {
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
    sendToController(pattern, gapMs, minDurationExempt);
    // Device haptics (mobile phone buzz); no-op on desktop, where controllers rumble.
    getPlatform().device.vibrate(totalDuration);
    activeIntensity = peakIntensity;
    activeUntil = now + effectiveDuration;
    scheduleDecay(effectiveDuration);
  } else {
    // Motor already vibrating at this intensity, so drop it to prevent queue buildup
    debugMergedCount++;
  }
};

// Family strength curve, user amplification override and (where needed) a minimum-duration
// floor, resolved from the SDL type announced at connect (controller-family-cache.ts). Combined
// in vibration-shaping.ts.
const shapeForDevice = (vendorId: number, productId: number, deviceKey: string, pattern: VibrationSegment[], minDurationExempt?: boolean): VibrationSegment[] => {
  const sdlType = recallControllerSdlType(vendorId, productId);
  if (!sdlType) return pattern;
  return applyVibrationShaping({ sdlType, deviceKey, pattern, minDurationExempt });
};

const sendToController = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean): void => {
  const gap = gapMs ?? 0;
  const manager = getInputManager();

  // Target the profile's mapped devices, with connection from the device snapshot
  // (hidDeviceCache): SDL only emits state on change, so an untouched pad never appears in an
  // event-derived set. Deliberately NOT gated on entry.hasRumble: SDL's backend can under-report
  // it, and a silent native no-op is safer than a false flag silencing the whole feature.
  for (const key of manager.allowed.gamepadKeys) {
    if (!deviceHapticsEnabled(key)) continue;
    const entry = manager.hidDeviceCache.find((d) => d.deviceKey === key);
    if (!entry || entry.status !== 'ready') continue;
    const [vidHex, pidHex] = key.split(':');
    const shaped = shapeForDevice(parseInt(vidHex, 16), parseInt(pidHex, 16), key, pattern, minDurationExempt);
    controllersStore.vibratePattern(key, shaped, gap);
  }
};

/**
 * Fires an authored haptic pattern at one device directly, bypassing mixer/cooldown/profile
 * targeting (a calibration-screen test must always fire). Same scaling and shaping as a live
 * event, so the felt strength matches gameplay.
 */
const previewHapticPattern = (deviceKey: string, patternId: HapticPatternId): Promise<VibrateResult> => {
  const entry = HAPTIC_PATTERNS[patternId];
  const scale = getHapticIntensityScale();
  const scaled = entry.segments.map((seg) => ({ durationMs: seg.durationMs, intensity: Math.min(1, seg.intensity * scale) }));
  const [vidHex, pidHex] = deviceKey.split(':');
  const shaped = shapeForDevice(parseInt(vidHex, 16), parseInt(pidHex, 16), deviceKey, scaled, entry.minDurationExempt);
  return controllersStore.vibratePattern(deviceKey, shaped, entry.gapMs ?? 0);
};

const scheduleDecay = (ms: number): void => {
  if (decayTimer !== null) clearTimeout(decayTimer);
  decayTimer = setTimeout(() => {
    activeIntensity = 0;
    activeUntil = 0;
    decayTimer = null;
  }, ms);
};


const initHapticBridge = (settings: HapticSettings): void => {
  if (initialized) return;
  initialized = true;

  if (window.api?.isDev) startDebugLog();
  setVibrateFunction(dispatchVibration);
  updateHapticSettings(settings);
  readRumbleStrength(getPlatform().files).then(loadRumbleStrengthCache).catch(() => {});

  (window as any).__onHapticEvent = (eventType: number, param: number) => {
    debugCHookCount++;
    handleHapticEvent(eventType, param);
  };
};

const updateHapticBridgeSettings = (settings: HapticSettings): void => {
  updateHapticSettings(settings);
};

const updateHapticsProfileEnabled = (enabled: boolean): void => {
  hapticsProfileEnabled = enabled;
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
  previewHapticPattern,
  updateHapticBridgeSettings,
  updateHapticsProfileEnabled
};
