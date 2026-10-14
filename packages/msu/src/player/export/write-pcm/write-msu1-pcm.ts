/* @layer renderer-lib @kind logic */
import { MSU1_HEADER_BYTES, MSU1_BYTES_PER_FRAME } from '../../decode/parse-msu1';
import { INT16_MAX, INT16_MIN, INT16_SCALE, MSU1_MAGIC_BYTES } from './write-pcm.constants';

const toInt16 = (sample: number): number => {
  const finite = Number.isFinite(sample) ? sample : 0;
  const clamped = Math.max(-1, Math.min(1, finite));
  const scaled = Math.round(clamped * INT16_SCALE);
  if (scaled > INT16_MAX) return INT16_MAX;
  return scaled < INT16_MIN ? INT16_MIN : scaled;
};

const stereoPair = (channels: Float32Array[]): [Float32Array, Float32Array] => {
  const [left, right] = channels;
  if (left === undefined) return [new Float32Array(0), new Float32Array(0)];
  return [left, right ?? left];
};

const clampedLoop = (loopSample: number, frames: number): number =>
  (Number.isFinite(loopSample) ? Math.max(0, Math.min(frames, Math.floor(loopSample))) : 0);

const writeMsu1Pcm = (channels: Float32Array[], loopSample: number): Uint8Array => {
  const [left, right] = stereoPair(channels);
  const frames = Math.min(left.length, right.length);

  const out = new Uint8Array(MSU1_HEADER_BYTES + frames * MSU1_BYTES_PER_FRAME);
  const view = new DataView(out.buffer);

  out.set(MSU1_MAGIC_BYTES, 0);
  view.setUint32(4, clampedLoop(loopSample, frames), true);

  let offset = MSU1_HEADER_BYTES;
  for (let i = 0; i < frames; i += 1) {
    view.setInt16(offset, toInt16(left[i] ?? 0), true);
    view.setInt16(offset + 2, toInt16(right[i] ?? 0), true);
    offset += MSU1_BYTES_PER_FRAME;
  }

  return out;
};

export { writeMsu1Pcm };
