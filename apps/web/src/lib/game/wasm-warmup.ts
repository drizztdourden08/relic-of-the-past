/* @layer bridge-wasm @kind logic */
/**
 * WASM warmup — Facade over the three background load stages so the game core is
 * ready before the player ever hits Play:
 *   1. inject the Emscripten glue <script> (defines window.Zelda3; MODULARIZE, no
 *      side effects until called),
 *   2. fetch the .wasm bytes (streamed with progress over http; one IPC blob over
 *      file://),
 *   3. WebAssembly.compile() them into a cached Module.
 *
 * startGame() reuses the cached compiled Module (see instantiate-wasm), so the
 * fetch+compile cost is paid here in the background, not on the critical path.
 * Progress is reported to the caller (the useWasmWarmup hook → boot-progress-store).
 */
import { log } from '../log-bus';

type WarmReport = (patch: { phase?: string; message?: string; ratio?: number | null }) => void;

let compiledModule: WebAssembly.Module | null = null;
let cachedBytes: ArrayBuffer | null = null;
let warmPromise: Promise<void> | null = null;
let gluePromise: Promise<void> | null = null;

const isHttpRenderer = (): boolean =>
  window.location.protocol === 'http:' || window.location.protocol === 'https:';

/** Inject the Emscripten glue script once and resolve when window.Zelda3 exists. */
const loadGlueScript = (): Promise<void> => {
  if ((window as unknown as { Zelda3?: unknown }).Zelda3) return Promise.resolve();
  if (gluePromise) return gluePromise;
  gluePromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = './wasm/zelda3.js';
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Failed to load zelda3.js glue'));
    document.head.appendChild(el);
  });
  return gluePromise;
};

/** Fetch the .wasm bytes with streamed progress when possible; cache the result. */
const loadWasmBytes = async (onProgress?: (ratio: number) => void): Promise<ArrayBuffer> => {
  if (cachedBytes) return cachedBytes;

  if (!isHttpRenderer()) {
    cachedBytes = await window.api.readWasmBytes(); // file:// — one IPC blob, no progress
    onProgress?.(1);
    return cachedBytes;
  }

  const url = new URL('./wasm/zelda3.wasm', window.location.href).href;
  const res = await fetch(url);
  const total = Number(res.headers.get('Content-Length')) || 0;
  if (!res.body || !total) {
    cachedBytes = await res.arrayBuffer(); // no length header — fall back to indeterminate
    onProgress?.(1);
    return cachedBytes;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(received / total);
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  cachedBytes = out.buffer;
  return cachedBytes;
};

const getCompiledModule = (): WebAssembly.Module | null => compiledModule;

/** Orchestrate the three stages, reporting progress. Idempotent (single-flight). */
const warmWasmCore = (report: WarmReport): Promise<void> => {
  if (warmPromise) return warmPromise;
  warmPromise = (async () => {
    try {
      report({ phase: 'glue', message: 'Loading engine…', ratio: null });
      await loadGlueScript();

      report({ phase: 'fetch', message: 'Loading game core…', ratio: 0 });
      const bytes = await loadWasmBytes((r) =>
        report({ ratio: r, message: `Loading game core… ${Math.round(r * 100)}%` }));

      report({ phase: 'compile', message: 'Preparing game core…', ratio: null });
      compiledModule = await WebAssembly.compile(bytes);

      report({ phase: 'ready', message: 'Ready', ratio: 1 });
      log.wasm('Game core warmed (compiled) in background');
    } catch (e) {
      report({ phase: 'error', message: 'Game core failed to load', ratio: null });
      log.error(`WASM warmup failed: ${e instanceof Error ? e.message : e}`);
    }
  })();
  return warmPromise;
};

export { warmWasmCore, loadGlueScript, loadWasmBytes, getCompiledModule };
export type { WarmReport };
