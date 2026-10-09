/* @layer electron-main @kind constants */
const PROBE_TIMEOUT_MS = 30_000;

const ENCODE_TIMEOUT_MS = 10 * 60_000;

const PROBE_ARGS = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams'];

export { PROBE_TIMEOUT_MS, ENCODE_TIMEOUT_MS, PROBE_ARGS };
