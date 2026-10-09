/* @layer shared-types @kind logic */
import { MSU1_BYTES_PER_FRAME, MSU1_HEADER_BYTES } from './msu1-format.constants';

const msu1FrameCount = (byteLength: number): number =>
  Math.max(0, Math.floor((byteLength - MSU1_HEADER_BYTES) / MSU1_BYTES_PER_FRAME));

export { msu1FrameCount };
