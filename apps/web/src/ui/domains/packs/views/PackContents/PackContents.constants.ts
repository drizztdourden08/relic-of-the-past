/* @layer renderer-components @kind constants */
import { MSU1_BYTES_PER_FRAME, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE } from '@shared/types/msu1-format';

const PREVIEW_SECONDS = 30;
const PCM_PREVIEW_BYTES = MSU1_HEADER_BYTES + MSU1_SAMPLE_RATE * MSU1_BYTES_PER_FRAME * PREVIEW_SECONDS;
const MAX_PREVIEW_BYTES = 48 * 1024 * 1024;
const TOO_LARGE = 'Too large to preview.';

export { MAX_PREVIEW_BYTES, PCM_PREVIEW_BYTES, PREVIEW_SECONDS, TOO_LARGE };
