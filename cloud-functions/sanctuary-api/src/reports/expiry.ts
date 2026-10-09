/* @layer root-config @kind logic */
import type { Report } from '../../../../shared/sanctuary';
import { ORPHAN_CAP_MS, RETENTION_AFTER_CLOSE_MS } from './expiry.constants';

const expiryOf = ({ issue, extendedUntil, createdAt }: Report): number =>
  issue.closedAt !== null
    ? Math.max(issue.closedAt + RETENTION_AFTER_CLOSE_MS, extendedUntil ?? 0)
    : createdAt + ORPHAN_CAP_MS;

export { expiryOf };
