/* @layer store-site @kind logic */
import type { ProjectedVersion } from './approved-versions.type';

const approvedAtOf = (version: ProjectedVersion): number =>
  version.review?.decidedAt ?? version.approvedAt ?? version.createdAt;

export { approvedAtOf };
