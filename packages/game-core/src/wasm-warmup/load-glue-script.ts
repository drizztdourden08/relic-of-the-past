/* @layer bridge-wasm @kind logic */
import { warmupState } from './warmup-state';

const loadGlueScript = (): Promise<void> => {
  if (Reflect.get(window, 'Zelda3')) return Promise.resolve();
  if (warmupState.gluePromise) return warmupState.gluePromise;
  warmupState.gluePromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = './wasm/zelda3.js';
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Failed to load zelda3.js glue'));
    document.head.appendChild(el);
  });
  return warmupState.gluePromise;
};

export { loadGlueScript };
