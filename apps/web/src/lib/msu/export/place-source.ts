/* @layer renderer-lib @kind logic */
/**
 * The placement primitive every export mode schedules through: put one buffer on the offline
 * render timeline at a given time, optionally with a fade envelope, and the shared options and
 * ceiling that come with doing it.
 *
 * It sits below ./schedule-layer and ./schedule-loop so both can place a source without either
 * one owning the other's contract.
 */
import type { FadeEnvelope } from './fade-envelope';
import { createFadeNode, hasFade } from './fade-envelope';

interface ScheduleOptions {
  ctx: BaseAudioContext;
  windowSeconds: number;
  /** Track seed; each layer derives its own stream from it. */
  seed: number;
  /**
   * Play the pool once instead of repeating it. Set for the layer whose own loop point is
   * carried into the exported header, where the player itself does the repeating.
   */
  singlePass?: boolean;
}

/** How a mode places its sources: a buffer, when it starts, where in it, and any fade. */
type PlaySource = (buffer: AudioBuffer, when: number, offsetSeconds?: number,
  fade?: FadeEnvelope) => void;

/** A ceiling on scheduled sources, so a degenerate manifest (a zero gap) cannot spin forever. */
const MAX_EVENTS = 4096;

/** A fading source gets its own gain node between it and the layer, exactly as a live voice does. */
const startSource = (ctx: BaseAudioContext, destination: AudioNode, buffer: AudioBuffer,
  when: number, offsetSeconds = 0, fade?: FadeEnvelope): void => {
  const at = Math.max(0, when);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(fade && hasFade(fade) ? createFadeNode(ctx, destination, at, fade) : destination);
  source.start(at, Math.max(0, Math.min(offsetSeconds, buffer.duration)));
};

export { startSource, MAX_EVENTS };
export type { ScheduleOptions, PlaySource };
