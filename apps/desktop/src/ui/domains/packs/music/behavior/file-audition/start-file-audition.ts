/* @layer renderer-components @kind logic */
import { decodeAudioFile } from '@rotp/msu';
import { auditionState } from './audition-state';
import { stopFileAudition } from './stop-file-audition';
import type { Audition } from './file-audition.type';

const audioContext = (): AudioContext => {
  auditionState.context ??= new AudioContext();
  return auditionState.context;
};

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
    if (auditionState.playing === node) { auditionState.playing = null; onEnded(); }
  };
  auditionState.playing = node;
  const startedAt = ctx.currentTime;
  node.start();

  const { duration, sampleRate } = buffer;
  return {
    durationSeconds: duration,
    loopSeconds: loopSample > 0 ? loopSample / sampleRate : null,
    positionSeconds: () => Math.min(duration, Math.max(0, ctx.currentTime - startedAt)),
    stop: () => { if (auditionState.playing === node) stopFileAudition(); },
  };
};

export { startFileAudition };
