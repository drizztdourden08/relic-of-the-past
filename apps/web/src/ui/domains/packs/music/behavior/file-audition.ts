/* @layer renderer-components @kind logic */
/**
 * Plays one file from the pack straight from its bytes: no layers, no schedule, no manifest, so it
 * works on a file nothing plays yet. ONE plays at a time, enforced here via module state so any
 * row or panel's press silences the last. The loop point comes back from the decode, which has
 * already parsed the `.pcm` header, so the whole-file read is paid for once.
 */
import { decodeAudioFile } from '@app/lib/msu/decode/decode-audio-file';

interface Audition {
  /** Seconds into the file, read from the audio clock. Safe to sample every frame. */
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
 * the file runs out on its own. Silenced twice on purpose: before the decode so a long file does
 * not keep the previous one going, and after, so of two racing presses the last to finish plays.
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
