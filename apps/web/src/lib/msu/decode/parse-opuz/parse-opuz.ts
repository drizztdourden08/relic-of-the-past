/* @layer renderer-lib @kind logic */
import type { OpuzAudio, OpuzRange } from './parse-opuz.type';
import {
  DROP_MASK, LOOP_BACK_FLAG, LOOP_START_FLAG, OPUZ_CHANNELS, OPUZ_HEADER_BYTES, OPUZ_RANGE_BYTES, OPUZ_SAMPLE_RATE,
} from './parse-opuz.constants';
import { hasOpuzMagic } from './has-opuz-magic';
import { readPackets } from './read-packets';

const parseOpuz = (bytes: Uint8Array): OpuzAudio => {
  if (!hasOpuzMagic(bytes)) throw new Error('Not an .opuz file: missing OPUZ magic');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ranges: OpuzRange[] = [];
  const seen = new Map<number, number>();
  let at = OPUZ_HEADER_BYTES;
  let loopBackTo = 0;
  let loopRange: number | null = null;

  for (;;) {
    if (at === 0 || at + OPUZ_RANGE_BYTES > bytes.byteLength) break;
    const already = seen.get(at);
    if (already !== undefined) {
      loopRange = already;
      break;
    }
    seen.set(at, ranges.length);

    const offset = view.getUint32(at, true);
    const samples = view.getUint32(at + 4, true);
    const flags = view.getUint16(at + 8, true);
    if ((flags & LOOP_START_FLAG) !== 0) loopBackTo = at;
    if (samples === 0 || offset < OPUZ_HEADER_BYTES || offset >= bytes.byteLength) break;

    const drop = flags & DROP_MASK;
    ranges.push({ packets: readPackets(bytes, view, offset, drop + samples), drop, samples });
    at = (flags & LOOP_BACK_FLAG) !== 0 ? loopBackTo : at + OPUZ_RANGE_BYTES;
  }

  if (ranges.length === 0) throw new Error('Unusable .opuz file: its range table names no audio');
  return { ranges, loopRange, sampleRate: OPUZ_SAMPLE_RATE, channels: OPUZ_CHANNELS };
};

export { parseOpuz };
