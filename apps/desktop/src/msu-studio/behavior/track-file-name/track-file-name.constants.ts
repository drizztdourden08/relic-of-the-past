/* @layer renderer-components @kind constants */
const NUMBERED_RE = /^(.*?)(\d+)\.([a-z0-9]+)$/i;
const UNSAFE_RE = /[\\/:*?"<>|]/g;

export { NUMBERED_RE, UNSAFE_RE };
