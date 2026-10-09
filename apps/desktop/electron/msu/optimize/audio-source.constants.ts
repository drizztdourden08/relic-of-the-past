/* @layer electron-main @kind constants */
import { MSU1_CHANNELS, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE } from '@shared/types/msu1-format';

const MSU1_EXTENSION = 'pcm';

const MSU1_INPUT_ARGS = [
  '-f', 's16le',
  '-ar', String(MSU1_SAMPLE_RATE),
  '-ac', String(MSU1_CHANNELS),
  '-skip_initial_bytes', String(MSU1_HEADER_BYTES),
];

export { MSU1_EXTENSION, MSU1_INPUT_ARGS };
