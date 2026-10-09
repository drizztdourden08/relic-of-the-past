/* @layer shared-storage @kind constants */
import { MSU1_BYTES_PER_FRAME, MSU1_SAMPLE_RATE } from '@shared/types/msu1-format';

const MSU1_BIT_RATE = MSU1_SAMPLE_RATE * MSU1_BYTES_PER_FRAME * 8;

const PROBEABLE_EXTENSIONS = new Set(['mp3', 'ogg', 'flac', 'opus']);

const PROBE_CONCURRENCY = 4;

const MSU1_LOOP_SAMPLE_OFFSET = 4;

export { MSU1_BIT_RATE, MSU1_LOOP_SAMPLE_OFFSET, PROBE_CONCURRENCY, PROBEABLE_EXTENSIONS };
