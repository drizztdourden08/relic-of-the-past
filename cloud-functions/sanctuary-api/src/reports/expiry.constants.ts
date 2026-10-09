/* @layer root-config @kind constants */
const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_AFTER_CLOSE_MS = 30 * DAY_MS;
const ORPHAN_CAP_MS = 90 * DAY_MS;

export { DAY_MS, RETENTION_AFTER_CLOSE_MS, ORPHAN_CAP_MS };
