/* @layer renderer-lib @kind logic */
import { MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE, MSU1_BYTES_PER_FRAME } from '../../../msu1-format';
import type { Msu1Audio } from './parse-msu1.type';
import { PCM_SAMPLE_SCALE } from './parse-msu1.constants';
import { hasMsu1Magic } from './has-msu1-magic';

const parseMsu1 = (bytes: Uint8Array): Msu1Audio => {
  if (!hasMsu1Magic(bytes)) throw new Error('Not an MSU-1 file: missing MSU1 magic');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const loopSample = view.getUint32(4, true);
  const frames = Math.floor((bytes.byteLength - MSU1_HEADER_BYTES) / MSU1_BYTES_PER_FRAME);

  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  let offset = MSU1_HEADER_BYTES;
  for (let i = 0; i < frames; i += 1) {
    left[i] = view.getInt16(offset, true) / PCM_SAMPLE_SCALE;
    right[i] = view.getInt16(offset + 2, true) / PCM_SAMPLE_SCALE;
    offset += MSU1_BYTES_PER_FRAME;
  }

  return { channels: [left, right], loopSample: loopSample <= frames ? loopSample : 0, sampleRate: MSU1_SAMPLE_RATE };
};

export { parseMsu1 };
