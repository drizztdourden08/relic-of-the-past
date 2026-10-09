/* @layer shared-game @kind logic */
import type { StateStamp } from '../save-state.type';
import { LENGTH_BYTES, MAGIC, TRAILER_FIXED } from './state-file.constants';
import { stripStamp } from './strip-stamp';

const encoder = new TextEncoder();

const appendStamp = (buffer: ArrayBuffer, stamp: StateStamp): ArrayBuffer => {
  const base = new Uint8Array(stripStamp(buffer));
  const json = encoder.encode(JSON.stringify(stamp));

  const out = new Uint8Array(base.byteLength + json.byteLength + TRAILER_FIXED);
  out.set(base, 0);
  out.set(json, base.byteLength);

  const view = new DataView(out.buffer);
  view.setUint32(base.byteLength + json.byteLength, json.byteLength, true);
  out.set(encoder.encode(MAGIC), base.byteLength + json.byteLength + LENGTH_BYTES);

  return out.buffer;
};

export { appendStamp };
