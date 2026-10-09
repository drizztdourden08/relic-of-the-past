/* @layer bridge-wasm @kind constants */
const DOTTED_QUAD = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_UNIQUE_LOCAL = /^f[cd][0-9a-f]{2}:/;
const IPV6_LINK_LOCAL = /^fe[89ab][0-9a-f]:/;
const BRACKETED_HOST = /^\[([^\]]+)\]/;

export { BRACKETED_HOST, DOTTED_QUAD, IPV6_LINK_LOCAL, IPV6_UNIQUE_LOCAL };
