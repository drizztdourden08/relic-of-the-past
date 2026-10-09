/* @layer electron-main @kind constants */
const FLAC_COMPRESSION_LEVEL = '5';

const PROGRESS_ARGS = ['-progress', 'pipe:1', '-nostats'];

const OUT_TIME_LINE = /^out_time_us=(\d+)$/;

const MICROSECONDS_PER_SECOND = 1_000_000;

export { FLAC_COMPRESSION_LEVEL, MICROSECONDS_PER_SECOND, OUT_TIME_LINE, PROGRESS_ARGS };
