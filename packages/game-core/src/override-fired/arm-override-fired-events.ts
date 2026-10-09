/* @layer bridge-wasm @kind logic */
import type { OverrideFiredHandler } from './override-fired.type';

const armOverrideFiredEvents = (handler: OverrideFiredHandler): void => {
  const deferOutOfWasmFrame = (fireId: number): void => {
    queueMicrotask(() => handler(fireId));
  };
  Object.assign(window, { __onOverrideFired: deferOutOfWasmFrame });
};

export { armOverrideFiredEvents };
