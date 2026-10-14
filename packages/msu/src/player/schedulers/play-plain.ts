/* @layer renderer-lib @kind logic */
import type { LoopRun } from './loop-scheduler.type';
import { nextFileIndex } from './next-file-index';

const playPlain = (run: LoopRun, index: number, offsetSeconds: number): void => {
  const { ctx, order, state } = run;
  state.fileIndex = index;
  const loopsItself = ctx.files.length === 1 || order === 'single';
  const voice = ctx.play(index, {
    loop: loopsItself,
    offsetSeconds,
    onEnded: loopsItself ? undefined : () => { state.voices = []; playPlain(run, nextFileIndex(run), ctx.loopSeconds); },
  });
  state.voices = [{ voice, fileIndex: index }];
};

export { playPlain };
