/* @layer bridge-wasm @kind logic */
import { appApi } from '@app/ipc/app-api';
import { warmupState } from './warmup-state';

const isHttpRenderer = (): boolean =>
  window.location.protocol === 'http:' || window.location.protocol === 'https:';

const joinChunks = (chunks: readonly Uint8Array[], received: number): ArrayBuffer => {
  const out = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out.buffer;
};

const loadWasmBytes = async (onProgress?: (ratio: number) => void): Promise<ArrayBuffer> => {
  if (warmupState.cachedBytes) return warmupState.cachedBytes;

  if (!isHttpRenderer()) {
    warmupState.cachedBytes = await appApi().readWasmBytes();
    onProgress?.(1);
    return warmupState.cachedBytes;
  }

  const url = new URL('./wasm/zelda3.wasm', window.location.href).href;
  const res = await fetch(url);
  const total = Number(res.headers.get('Content-Length')) || 0;
  if (!res.body || !total) {
    warmupState.cachedBytes = await res.arrayBuffer();
    onProgress?.(1);
    return warmupState.cachedBytes;
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
  warmupState.cachedBytes = joinChunks(chunks, received);
  return warmupState.cachedBytes;
};

export { loadWasmBytes };
