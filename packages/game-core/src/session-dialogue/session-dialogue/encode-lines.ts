/* @layer bridge-wasm @kind logic */
import { compressMarkedStrings } from '../highlight-bytes';
import { sessionPool } from './session-pool';

const encodeLines = (prepared: readonly string[], code: string): Uint8Array[] => {
  const { encoded } = sessionPool;
  const missing = [...new Set(prepared.filter((text) => !encoded.has(text)))];
  const chunks = compressMarkedStrings(missing, code);
  missing.forEach((text, i) => {
    const chunk = chunks[i];
    if (chunk !== undefined) encoded.set(text, chunk);
  });
  return prepared.map((text) => {
    const chunk = encoded.get(text);
    if (chunk === undefined) throw new Error('A dialogue line has no encoded bytes');
    return chunk;
  });
};

export { encodeLines };
