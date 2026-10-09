/* @layer bridge-wasm @kind logic */
import { compressMarkedStrings } from '../highlight-bytes';
import { sessionPool } from './session-pool';

const encodeLines = (prepared: readonly string[], code: string): Uint8Array[] => {
  const { encoded } = sessionPool;
  const missing = [...new Set(prepared.filter((text) => !encoded.has(text)))];
  compressMarkedStrings(missing, code).forEach((chunk, i) => encoded.set(missing[i], chunk));
  return prepared.map((text) => encoded.get(text) as Uint8Array);
};

export { encodeLines };
