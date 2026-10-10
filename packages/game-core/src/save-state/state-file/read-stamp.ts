/* @layer shared-game @kind logic */
import type { StateStamp } from '../save-state.type';
import { TRAILER_FIXED } from './state-file.constants';
import { trailerLength } from './trailer-length';

const decoder = new TextDecoder();

const isStamp = (value: unknown): value is StateStamp =>
  typeof value === 'object' && value !== null
  && Reflect.get(value, 'v') === 1 && typeof Reflect.get(value, 'formatId') === 'string';

const readStamp = (buffer: ArrayBuffer): StateStamp | null => {
  const total = trailerLength(buffer);
  if (!total) return null;
  const jsonEnd = buffer.byteLength - TRAILER_FIXED;
  const json = decoder.decode(new Uint8Array(buffer, jsonEnd - (total - TRAILER_FIXED), total - TRAILER_FIXED));
  try {
    const parsed: unknown = JSON.parse(json);
    return isStamp(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export { readStamp };
