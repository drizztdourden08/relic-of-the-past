/* @layer shared-store @kind constants */
const INSTALL_SCHEME = 'relic-of-the-past';
const SCHEME_AND_HOST = `${INSTALL_SCHEME}://install/`;
const MAX_LINK_CHARS = 256;
const MAX_VERSION = 1_000_000;

const DOC_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const RESERVED_ID_RE = /^__.*__$/;
const VERSION_QUERY_RE = /^v=([1-9][0-9]{0,6})$/;

export { INSTALL_SCHEME, SCHEME_AND_HOST, MAX_LINK_CHARS, MAX_VERSION, DOC_ID_RE, RESERVED_ID_RE, VERSION_QUERY_RE };
