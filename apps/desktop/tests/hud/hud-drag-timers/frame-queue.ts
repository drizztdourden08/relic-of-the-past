/* @layer tests @kind helper */
import { act } from 'react';

const createFrameQueue = () => {
  let pending = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;
  const realRaf = globalThis.requestAnimationFrame;
  const realCaf = globalThis.cancelAnimationFrame;

  const run = (times = 1): void => {
    for (let i = 0; i < times; i += 1) {
      const due = [...pending.values()];
      pending = new Map();
      act(() => { due.forEach((cb) => cb(0)); });
    }
  };

  const install = (): void => {
    pending = new Map();
    nextFrame = 1;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      const id = nextFrame; nextFrame += 1; pending.set(id, cb); return id;
    });
    globalThis.cancelAnimationFrame = ((id: number) => { pending.delete(id); });
  };

  const restore = (): void => {
    globalThis.requestAnimationFrame = realRaf;
    globalThis.cancelAnimationFrame = realCaf;
  };

  return { run, install, restore, size: (): number => pending.size };
};

export { createFrameQueue };
