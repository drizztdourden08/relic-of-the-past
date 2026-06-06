/* @layer electron-main @kind logic */
/**
 * HID haptic frame building — converts vibration parameters into
 * raw haptic data frames for Switch Pro Controller 2 (SPC2).
 */

import type { OpenDevice } from './hid-constants';

// Known-working haptic data from procon2tool TEST_HAPTIC_PATTERN
const HAPTIC_STRONG: number[] = [0x93, 0x35, 0x36, 0x1c, 0x0d];
const HAPTIC_MEDIUM: number[] = [0x75, 0x19, 0x41, 0x9b, 0x03];
const HAPTIC_LIGHT:  number[] = [0x48, 0x71, 0x20, 0x5a, 0x02];
const HAPTIC_SILENT: number[] = [0x3f, 0x01, 0xf0, 0x19, 0x00];

const hapticForIntensity = (intensity: number): number[] => {
  const clamped = Math.max(0, Math.min(1, intensity));
  return clamped >= 0.7 ? HAPTIC_STRONG
    : clamped >= 0.3 ? HAPTIC_MEDIUM
    : HAPTIC_LIGHT;
};

const buildSegmentFrames = (durationMs: number, intensity: number): number[][] => {
  const clamped = Math.max(0, Math.min(1, intensity));
  const sustain = hapticForIntensity(clamped);
  const frameCount = Math.max(1, Math.ceil(durationMs / 4));

  const frames: number[][] = [];
  if (frameCount > 6) {
    frames.push(HAPTIC_LIGHT);
    if (clamped >= 0.3) frames.push(HAPTIC_MEDIUM);
  }
  const releaseCount = Math.min(2, Math.max(1, Math.floor(frameCount * 0.1)));
  const sustainCount = Math.max(1, frameCount - frames.length - releaseCount);
  for (let i = 0; i < sustainCount; i++) frames.push(sustain);
  if (releaseCount >= 2 && clamped >= 0.3) frames.push(HAPTIC_LIGHT);
  frames.push(HAPTIC_SILENT);
  return frames;
};

const buildPatternFrames = (pattern: { durationMs: number; intensity: number }[], gapMs: number): number[][] => {
  const frames: number[][] = [];
  const gapFrames = Math.max(0, Math.ceil(gapMs / 4));

  for (let s = 0; s < pattern.length; s++) {
    const seg = pattern[s];
    const haptic = hapticForIntensity(seg.intensity);
    const count = Math.max(1, Math.ceil(seg.durationMs / 4));
    for (let i = 0; i < count; i++) frames.push(haptic);
    if (gapFrames > 0 && s < pattern.length - 1) {
      for (let i = 0; i < gapFrames; i++) frames.push(HAPTIC_SILENT);
    }
  }
  frames.push(HAPTIC_SILENT);
  return frames;
};

const writeFramesDirect = (dev: OpenDevice, frames: number[][]): void => {
  dev.hid.pause();
  let counter = 0;
  for (const hapticData of frames) {
    const buf = new Array(64).fill(0);
    buf[0] = 0x02;
    buf[1] = 0x50 | (counter & 0x0F);
    buf[17] = buf[1];
    for (let i = 0; i < hapticData.length; i++) {
      buf[2 + i] = hapticData[i];
      buf[18 + i] = hapticData[i];
    }
    try {
      dev.hid.write(buf);
    } catch { /* device may have disconnected */ }
    counter = (counter + 1) & 0x0F;
  }
  dev.hid.resume();
};

const buildSilentFrame = (counterByte: number = 0x50): number[] => {
  const buf = new Array(64).fill(0);
  buf[0] = 0x02;
  buf[1] = counterByte;
  buf[17] = counterByte;
  for (let i = 0; i < HAPTIC_SILENT.length; i++) {
    buf[2 + i] = HAPTIC_SILENT[i];
    buf[18 + i] = HAPTIC_SILENT[i];
  }
  return buf;
};

export {
  HAPTIC_STRONG,
  HAPTIC_MEDIUM,
  HAPTIC_LIGHT,
  HAPTIC_SILENT,
  hapticForIntensity,
  buildSegmentFrames,
  buildPatternFrames,
  writeFramesDirect,
  buildSilentFrame,
};
