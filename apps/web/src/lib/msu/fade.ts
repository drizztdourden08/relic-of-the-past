/* @layer renderer-lib @kind logic */
/**
 * The game's music fades, reproduced on a gain node.
 *
 * The game asks for volume transitions with three control bytes rather than a level: fade
 * out, duck to a low level, and return to full. Each has its own speed, expressed by the
 * original as a per-frame step out of 256 at 60 frames a second — converted here into the
 * ramp duration Web Audio wants, so a fade takes the same wall-clock time it always did.
 */

/** Control bytes 0xf1..0xf3 map onto these targets and step rates, in the original's units. */
const TRANSITIONS: Record<number, { target: number; step: number }> = {
  0xf1: { target: 0, step: 7 },
  0xf2: { target: 64, step: 3 },
  0xf3: { target: 255, step: 3 },
};

/** Instant restore used when a track starts, rather than easing in from nothing. */
const FULL_STEP = 24;
const FRAMES_PER_SECOND = 60;

const isFadeControl = (ctrl: number): boolean => ctrl in TRANSITIONS;

/** Seconds a ramp between two normalized levels should take at the given per-frame step. */
const rampSeconds = (from: number, to: number, step: number): number =>
  Math.abs(to - from) / (step / 255) / FRAMES_PER_SECOND;

/**
 * Applies one of the game's transitions to `gain`. Returns the normalized target so callers
 * can track the level a following track should start from.
 */
const applyFade = (gain: GainNode, now: number, ctrl: number): number => {
  const transition = TRANSITIONS[ctrl];
  if (!transition) return gain.gain.value;
  const target = transition.target / 255;
  const seconds = rampSeconds(gain.gain.value, target, transition.step);
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(target, now + Math.max(0.001, seconds));
  return target;
};

/** Brings a gain node back to full at the original's fastest step — used when a track starts. */
const restoreFull = (gain: GainNode, now: number): void => {
  const seconds = rampSeconds(gain.gain.value, 1, FULL_STEP);
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(1, now + Math.max(0.001, seconds));
};

export { applyFade, restoreFull, isFadeControl };
