/* @layer renderer-lib @kind logic */
/**
 * Writes the MSU-1 `.pcm` container: the exact inverse of ../decode/parse-msu1.
 *
 * Layout, matching that reader byte for byte: the ASCII bytes M,S,U,1; a 32-bit
 * little-endian loop point measured in FRAMES (a left+right pair), not bytes; then interleaved
 * signed 16-bit little-endian stereo.
 *
 * Two invariants of the format the caller has to respect, because this module cannot fix
 * either one: MSU-1 is always stereo (mono input is duplicated here) and always 44100 Hz
 * (there is no resampler here — the caller delivers 44100 Hz data).
 */
import { MSU1_HEADER_BYTES, MSU1_BYTES_PER_FRAME } from '../decode/parse-msu1';

/** parse-msu1 reads a sample as `int16 / 32768`, so writing is a multiply by the same scale. */
const INT16_SCALE = 32768;
const INT16_MIN = -32768;
const INT16_MAX = 32767;

/**
 * Clamps to [-1, 1) before scaling. Without the clamp a hot mix — several layers summed at
 * full volume — would overflow int16 and wrap from a loud peak into the opposite polarity,
 * which is heard as a click or a burst of noise rather than as distortion.
 */
const toInt16 = (sample: number): number => {
  const finite = Number.isFinite(sample) ? sample : 0;
  const clamped = finite < -1 ? -1 : (finite > 1 ? 1 : finite);
  const scaled = Math.round(clamped * INT16_SCALE);
  if (scaled > INT16_MAX) return INT16_MAX;
  return scaled < INT16_MIN ? INT16_MIN : scaled;
};

/** Mono is duplicated to both sides; anything wider than stereo keeps its first two channels. */
const stereoPair = (channels: Float32Array[]): [Float32Array, Float32Array] => {
  if (channels.length === 0) return [new Float32Array(0), new Float32Array(0)];
  if (channels.length === 1) return [channels[0], channels[0]];
  return [channels[0], channels[1]];
};

const writeMsu1Pcm = (channels: Float32Array[], loopSample: number): Uint8Array => {
  const [left, right] = stereoPair(channels);
  const frames = Math.min(left.length, right.length);

  const out = new Uint8Array(MSU1_HEADER_BYTES + frames * MSU1_BYTES_PER_FRAME);
  const view = new DataView(out.buffer);

  out[0] = 0x4d; // M
  out[1] = 0x53; // S
  out[2] = 0x55; // U
  out[3] = 0x31; // 1
  // A loop point past the end would make a player seek outside the stream, so it is clamped
  // here rather than trusted — the same tolerance parse-msu1 applies on the way in.
  const loop = Number.isFinite(loopSample) ? Math.max(0, Math.min(frames, Math.floor(loopSample))) : 0;
  view.setUint32(4, loop, true);

  let offset = MSU1_HEADER_BYTES;
  for (let i = 0; i < frames; i += 1) {
    view.setInt16(offset, toInt16(left[i]), true);
    view.setInt16(offset + 2, toInt16(right[i]), true);
    offset += MSU1_BYTES_PER_FRAME;
  }

  return out;
};

export { writeMsu1Pcm, INT16_SCALE };
