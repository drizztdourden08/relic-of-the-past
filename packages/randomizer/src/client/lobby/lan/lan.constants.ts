/* @layer bridge-wasm @kind constants */
const SERVICE_NAME = /^_([^.]+)\._(tcp|udp)$/;
const DOTTED_QUAD = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export { DOTTED_QUAD, SERVICE_NAME };
