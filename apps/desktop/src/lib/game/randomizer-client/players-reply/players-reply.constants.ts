/* @layer bridge-wasm @kind constants */
const REPLY_PATTERN = /^\d+ players? of \d+ connected\b/;
const TEAM_SPLIT = /\s*:: Team #(\d+): /;

export { REPLY_PATTERN, TEAM_SPLIT };
