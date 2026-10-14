/* @layer renderer-lib @kind logic */
import type { LoopRun } from './loop-scheduler.type';

const nextFileIndex = (run: LoopRun): number => {
  const { ctx, order, state } = run;
  if (ctx.files.length <= 1 || order === 'single') return 0;
  if (order === 'sequential') return (state.fileIndex + 1) % ctx.files.length;
  let candidate = state.fileIndex;
  while (candidate === state.fileIndex) candidate = Math.floor(Math.random() * ctx.files.length);
  return candidate;
};

export { nextFileIndex };
