/* @layer bridge-wasm @kind constants */
const HAS_SCHEME = /^wss?:\/\//i;
const BARE_ORIGIN = /^(wss?:\/\/[^/]+)\/?$/i;

export { BARE_ORIGIN, HAS_SCHEME };
