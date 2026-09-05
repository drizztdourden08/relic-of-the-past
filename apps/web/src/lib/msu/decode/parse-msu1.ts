/* @layer renderer-lib @kind logic */
import {
  MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE, MSU1_CHANNELS, MSU1_BYTES_PER_FRAME,
} from '@shared/types/msu1-format';

/**
 * The MSU-1 `.pcm` container: 4-byte "MSU1" magic, a 32-bit little-endian loop point
 * measured in samples, then interleaved signed 16-bit little-endian stereo at 44100 Hz.
 * This is the on-disk format every MSU-1 emulator and flash cart reads, so it is both what
 * we parse on import and what we write on export.
 */

const MSU1_MAGIC = 0x4d535531; // 'MSU1' read big-endian, i.e. the bytes M,S,U,1

interface Msu1Audio {
  /** De-interleaved planar channel data, in playback order. */
  channels: Float32Array<ArrayBuffer>[];
  /** Frame index to restart from when looping. */
  loopSample: number;
  sampleRate: number;
}

const hasMsu1Magic = (bytes: Uint8Array): boolean =>
  bytes.byteLength >= MSU1_HEADER_BYTES &&
  bytes[0] === 0x4d && bytes[1] === 0x53 && bytes[2] === 0x55 && bytes[3] === 0x31;

/**
 * Decodes a `.pcm` body into planar float channels. Raw PCM needs no codec, so this is a
 * straight conversion, which is why `.pcm` playback works identically everywhere.
 */
const parseMsu1 = (bytes: Uint8Array): Msu1Audio => {
  if (!hasMsu1Magic(bytes)) throw new Error('Not an MSU-1 file: missing MSU1 magic');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const loopSample = view.getUint32(4, true);
  const frames = Math.floor((bytes.byteLength - MSU1_HEADER_BYTES) / MSU1_BYTES_PER_FRAME);

  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  let offset = MSU1_HEADER_BYTES;
  for (let i = 0; i < frames; i += 1) {
    left[i] = view.getInt16(offset, true) / 32768;
    right[i] = view.getInt16(offset + 2, true) / 32768;
    offset += MSU1_BYTES_PER_FRAME;
  }

  return { channels: [left, right], loopSample: loopSample <= frames ? loopSample : 0, sampleRate: MSU1_SAMPLE_RATE };
};

export { parseMsu1, hasMsu1Magic, MSU1_MAGIC, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE, MSU1_CHANNELS, MSU1_BYTES_PER_FRAME };
export type { Msu1Audio };
