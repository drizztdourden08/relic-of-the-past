/* @layer renderer-lib @kind logic */
import type { LoopRun } from './loop-scheduler.type';
import { nextFileIndex } from './next-file-index';

const playFaded = (run: LoopRun, index: number, offsetSeconds: number, fadeIn: boolean): void => {
  const { ctx, crossfade, state } = run;
  state.fileIndex = index;
  const duration = ctx.files[index]?.buffer.duration ?? 0;
  const window = Math.min(crossfade, duration / 2);
  const remaining = Math.max(0, duration - offsetSeconds);
  const handoffIn = Math.max(0, remaining - window);

  const voice = ctx.play(index, {
    loop: false,
    offsetSeconds,
    fadeInSeconds: fadeIn ? window : 0,
    fadeOutAfterSeconds: handoffIn,
    fadeOutSeconds: window,
    onEnded: () => { state.voices = state.voices.filter((v) => v.voice !== voice); },
  });
  state.voices.push({ voice, fileIndex: index });

  state.handoff = setTimeout(() => {
    state.handoff = null;
    playFaded(run, nextFileIndex(run), ctx.loopSeconds, true);
  }, handoffIn * 1000);
};

export { playFaded };
