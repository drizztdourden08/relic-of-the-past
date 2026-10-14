/* @layer bridge-wasm @kind logic */
import { portKitApi } from '@drizztdourden08/brock-port-kit/renderer';
import { warmupState } from '@rotp/game-core';
import type { ByteProgress as Progress } from '@rotp/game-core';
import { ROTP_CORE } from '../port/rotp-port.constants';

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

const readBundledCore = async (onProgress?: Progress): Promise<ArrayBuffer> => {
  const bytes = await portKitApi()?.readCore(ROTP_CORE.wasm);
  if (!bytes) throw new Error(`The core ${ROTP_CORE.wasm} is not in the app bundle.`);
  onProgress?.(1);
  return bytes;
};

const streamBody = async (body: ReadableStream<Uint8Array>, total: number, onProgress?: Progress): Promise<ArrayBuffer> => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(received / total);
  }
  return joinChunks(chunks, received);
};

const fetchCore = async (onProgress?: Progress): Promise<ArrayBuffer> => {
  const res = await fetch(new URL(ROTP_CORE.wasm, window.location.href).href);
  const total = Number(res.headers.get('Content-Length')) || 0;
  if (res.body && total) return streamBody(res.body, total, onProgress);
  const bytes = await res.arrayBuffer();
  onProgress?.(1);
  return bytes;
};

const loadWasmBytes = async (onProgress?: Progress): Promise<ArrayBuffer> => {
  warmupState.cachedBytes ??= await (isHttpRenderer() ? fetchCore(onProgress) : readBundledCore(onProgress));
  return warmupState.cachedBytes;
};

export { loadWasmBytes };
