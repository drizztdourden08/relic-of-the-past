/* @layer bridge-wasm @kind constants */
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const BRACKETED_HOST = /^\[([^\]]+)\]/;
const LOOPBACK_ADDRESS = /^127(\.\d{1,3}){3}$/;

export { BRACKETED_HOST, LOOPBACK_ADDRESS, URL_SCHEME };
