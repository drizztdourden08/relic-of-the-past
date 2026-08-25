/* @layer renderer-lib @kind logic */
/**
 * The gain node one offline source fades through, in exactly the shape ../voice.ts gives a live
 * voice: rise from silence over `fadeInSeconds`, then fall to silence over `fadeOutSeconds`
 * starting `fadeOutAfterSeconds` after the source began.
 *
 * It is a deliberate duplicate of that envelope rather than a shared helper, because the two run
 * against different clocks — a live voice always starts at `currentTime`, an offline source starts
 * at a time computed ahead of it — and the ramp maths is the whole point of the match. Any change
 * to voice.ts's envelope has to be mirrored here or an exported pack stops sounding like its
 * preview.
 */

interface FadeEnvelope {
  /** Rise from 0 to full over this many seconds from the source's start. */
  fadeInSeconds?: number;
  /** Fall to 0 over `fadeOutSeconds`, starting this many seconds after the source's start. */
  fadeOutAfterSeconds?: number;
  fadeOutSeconds?: number;
}

/** Whether a fade is actually asked for — voice.ts inserts no gain node when nothing fades. */
const hasFade = (fade: FadeEnvelope): boolean => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = fade;
  return fadeInSeconds > 0 || (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0);
};

/**
 * Builds a gain node carrying the envelope, connected to `destination`. `startedAt` is when the
 * source it belongs to starts, which offline is a scheduled time rather than "now".
 */
const createFadeNode = (ctx: BaseAudioContext, destination: AudioNode,
  startedAt: number, fade: FadeEnvelope): GainNode => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = fade;
  const node = ctx.createGain();
  node.connect(destination);
  const { gain } = node;

  if (fadeInSeconds > 0) {
    gain.setValueAtTime(0, startedAt);
    gain.linearRampToValueAtTime(1, startedAt + fadeInSeconds);
  } else {
    gain.setValueAtTime(1, startedAt);
  }
  if (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0) {
    // The max() is voice.ts's: a fade-out is never allowed to start before the rise has finished.
    const outAt = startedAt + Math.max(fadeInSeconds, fadeOutAfterSeconds);
    gain.setValueAtTime(1, outAt);
    gain.linearRampToValueAtTime(0, outAt + fadeOutSeconds);
  }

  return node;
};

export { createFadeNode, hasFade };
export type { FadeEnvelope };
