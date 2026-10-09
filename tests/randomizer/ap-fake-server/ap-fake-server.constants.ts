/* @layer tests @kind constants */
const VERSION = { major: 0, minor: 6, build: 3, class: 'Version' as const };
const STATUS_KEY = /^_read_client_status_\d+_(\d+)$/;

export { STATUS_KEY, VERSION };
