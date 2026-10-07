/* @layer root-config @kind logic */
/** When a report's zip and record go away. Closed issue: 30 days after the
 *  close, or later when a member extended it. Never closed: a flat 90 days.
 *  The same numbers the old cleanup function applied. */
import type { Report } from '../../../../shared/sanctuary';

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_AFTER_CLOSE_MS = 30 * DAY_MS;
const ORPHAN_CAP_MS = 90 * DAY_MS;

const expiryOf = ({ issue, extendedUntil, createdAt }: Report): number =>
  issue.closedAt !== null
    ? Math.max(issue.closedAt + RETENTION_AFTER_CLOSE_MS, extendedUntil ?? 0)
    : createdAt + ORPHAN_CAP_MS;

const isExpired = (report: Report, at: number): boolean => at >= expiryOf(report);

export { expiryOf, isExpired, DAY_MS };
