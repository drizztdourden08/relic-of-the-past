/* @layer bridge-wasm @kind logic */
import type { LinkDiedListener } from './ap-link-died.type';
import { deathOf } from './death-of';

const onLinkDied = (listener: LinkDiedListener): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const runAfterWasmFrame = (cause?: unknown): void => {
    queueMicrotask(() => listener(deathOf(cause)));
  };
  window.__onLinkDied = runAfterWasmFrame;
  return () => {
    if (window.__onLinkDied === runAfterWasmFrame) window.__onLinkDied = null;
  };
};

export { onLinkDied };
