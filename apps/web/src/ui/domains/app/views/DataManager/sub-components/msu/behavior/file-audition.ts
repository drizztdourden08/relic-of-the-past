/* @layer renderer-components @kind logic */
/**
 * Plays one file from the pack, on its own, straight from its bytes.
 *
 * Deliberately simple next to the pack engine: no layers, no schedule, no volume shaping — the
 * point of auditioning a file from the pool is hearing the file, not hearing what some slot would
 * make of it. That also means it needs nothing from a manifest, so it works on a file nothing plays
 * yet, which is the case someone reaches for this in.
 *
 * ONE plays at a time, and that is enforced here rather than by whoever calls it: the context and
 * the source node are module state, so a second press silences the first no matter which row or
 * which panel asked. Two files at once would be noise, not a comparison.
 *
 * The loop point comes back from the decode rather than from a second read. A `.pcm` carries it in
 * its own header, which the decoder has already parsed by the time it hands back a buffer — so the
 * one thing that needs the whole file is paid for once, by the press that plays it.
 */
import { decodeAudioFile } from '@app/lib/msu/decode/decode-audio-file';

interface Audition {
  /** Seconds into the file, read from the audio clock — safe to sample every frame. */
  positionSeconds: () => number;
  durationSeconds: number;
  /** Where the file repeats from, or null when it declares no point of its own. */
  loopSeconds: number | null;
  /** Silences it, unless something newer already replaced it. */
  stop: () => void;
}

let context: AudioContext | null = null;
let playing: AudioBufferSourceNode | null = null;

const audioContext = (): AudioContext => {
  context ??= new AudioContext();
  return context;
};

/** Stop whatever file is sounding. Safe to call when nothing is. */
const stopFileAudition = (): void => {
  if (playing === null) return;
  const node = playing;
  playing = null;
  node.onended = null;
  node.stop();
};

/**
 * Decode `bytes` and start playing them, replacing anything already sounding. `onEnded` fires when
 * the file runs out on its own, so a caller's "playing" state can clear itself.
 *
 * The silence happens twice on purpose — once before the decode so a long file does not keep the
 * previous one going while it works, and once after, so of two presses racing on their decodes the
 * one that finishes last is the one left playing.
 */
const startFileAudition = async (
  fileName: string,
  bytes: Uint8Array,
  onEnded: () => void,
): Promise<Audition> => {
  stopFileAudition();
  const ctx = audioContext();
  const { buffer, loopSample } = await decodeAudioFile(ctx, fileName, bytes);
  stopFileAudition();

  void ctx.resume();
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.connect(ctx.destination);
  node.onended = () => {
    // Only clear when this node is still the current one: a newer press already replaced it.
    if (playing === node) { playing = null; onEnded(); }
  };
  playing = node;
  const startedAt = ctx.currentTime;
  node.start();

  const { duration, sampleRate } = buffer;
  return {
    durationSeconds: duration,
    loopSeconds: loopSample > 0 ? loopSample / sampleRate : null,
    positionSeconds: () => Math.min(duration, Math.max(0, ctx.currentTime - startedAt)),
    stop: () => { if (playing === node) stopFileAudition(); },
  };
};

export { startFileAudition, stopFileAudition };
export type { Audition };
