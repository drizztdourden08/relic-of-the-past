/* @layer shared-store @kind logic */
import { VERSION_FLOW } from './version-flow.constants';
import type { FlowStep, FlowVersion, VersionAction } from './version-flow.type';

const stepOf = (version: FlowVersion, action: VersionAction): FlowStep | null =>
  VERSION_FLOW[version.review.state][action] ?? null;

export { stepOf };
