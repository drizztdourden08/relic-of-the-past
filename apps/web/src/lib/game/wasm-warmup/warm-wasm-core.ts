/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { loadGlueScript } from './load-glue-script';
import { loadWasmBytes } from './load-wasm-bytes';
import { warmupState } from './warmup-state';
import type { WarmReport } from './wasm-warmup.type';

const warmWasmCore = (report: WarmReport): Promise<void> => {
  if (warmupState.warmPromise) return warmupState.warmPromise;
  warmupState.warmPromise = (async () => {
    try {
      report({ phase: 'glue', message: 'Loading engine...', ratio: null });
      await loadGlueScript();

      report({ phase: 'fetch', message: 'Loading game core...', ratio: 0 });
      const bytes = await loadWasmBytes((r) =>
        report({ ratio: r, message: `Loading game core... ${Math.round(r * 100)}%` }));

      report({ phase: 'compile', message: 'Preparing game core...', ratio: null });
      warmupState.compiledModule = await WebAssembly.compile(bytes);

      report({ phase: 'ready', message: 'Ready', ratio: 1 });
      log.wasm('Game core warmed (compiled) in background');
    } catch (e) {
      report({ phase: 'error', message: 'Game core failed to load', ratio: null });
      log.error(`WASM warmup failed: ${e instanceof Error ? e.message : e}`);
    }
  })();
  return warmupState.warmPromise;
};

export { warmWasmCore };
