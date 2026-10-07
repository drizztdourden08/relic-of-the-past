/* @layer shared-game @kind logic */
/**
 * The .sav container: the core's header, and the metadata trailer we add to it.
 *
 * A save state is an 8-word header, the input log, then the snapshot. Every length is
 * driven by the header and nothing is read to EOF, so bytes appended past the end are
 * invisible to the core. That is where the stamp goes:
 *
 *   [ core bytes ][ stamp json ][ uint32 json length ][ 8-byte magic ]
 *
 * One write site covers quick, manual and auto saves alike, and the metadata travels with
 * the file when it is copied or synced. Loading strips the trailer anyway instead of
 * relying on the core to ignore it. The assumption holds today, and this way nothing
 * depends on it continuing to.
 */
import type { StateStamp } from './types';

/** hdr[6]: the snapshot's byte length, which is what the core reads back. */
const HDR_SNAPSHOT_OFFSET = 24;
const HDR_BYTES = 32;
const CONTAINER_VERSION = 1;

const MAGIC = 'ROTPMETA';
const MAGIC_BYTES = 8;
const LENGTH_BYTES = 4;
const TRAILER_FIXED = MAGIC_BYTES + LENGTH_BYTES;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Total snapshot bytes this file carries, or null when it is not a save state at all. */
const readSnapshotBytes = (buffer: ArrayBuffer): number | null => {
  if (buffer.byteLength < HDR_BYTES) return null;
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== CONTAINER_VERSION) return null;
  return view.getUint32(HDR_SNAPSHOT_OFFSET, true);
};

const hasMagic = (bytes: Uint8Array): boolean => {
  if (bytes.byteLength < TRAILER_FIXED) return false;
  const start = bytes.byteLength - MAGIC_BYTES;
  return decoder.decode(bytes.subarray(start)) === MAGIC;
};

/** Byte length of the trailer on this buffer, or 0 when there is none. */
const trailerLength = (buffer: ArrayBuffer): number => {
  const bytes = new Uint8Array(buffer);
  if (!hasMagic(bytes)) return 0;
  const view = new DataView(buffer);
  const jsonLength = view.getUint32(buffer.byteLength - TRAILER_FIXED, true);
  const total = jsonLength + TRAILER_FIXED;
  // A length that would run past the front of the file is not our trailer.
  return total <= buffer.byteLength ? total : 0;
};

const readStamp = (buffer: ArrayBuffer): StateStamp | null => {
  const total = trailerLength(buffer);
  if (!total) return null;
  const jsonEnd = buffer.byteLength - TRAILER_FIXED;
  const json = decoder.decode(new Uint8Array(buffer, jsonEnd - (total - TRAILER_FIXED), total - TRAILER_FIXED));
  try {
    const parsed = JSON.parse(json) as StateStamp;
    return parsed?.v === 1 && typeof parsed.formatId === 'string' ? parsed : null;
  } catch {
    return null; // a trailer we cannot read is the same as no trailer
  }
};

/** The core's own bytes, with any trailer removed. Unstamped files pass through as-is. */
const stripStamp = (buffer: ArrayBuffer): ArrayBuffer => {
  const total = trailerLength(buffer);
  return total ? buffer.slice(0, buffer.byteLength - total) : buffer;
};

/** Re-stamping replaces instead of stacking, so a round-tripped buffer stays single-stamped. */
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

export { appendStamp, readSnapshotBytes, readStamp, stripStamp };
