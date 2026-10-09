/* @layer shared-store @kind logic */
import { stepOf } from './step-of';
import { NEEDS_FILE } from './version-flow.constants';
import type { Actor, FlowRefusal, FlowVersion, VersionAction } from './version-flow.type';

const refusalOf = (version: FlowVersion, action: VersionAction, actors: readonly Actor[]): FlowRefusal | null => {
  const step = stepOf(version, action);
  if (!step) return 'state';
  if (!step.by.some((actor) => actors.includes(actor))) return 'actor';
  if (NEEDS_FILE.includes(action) && version.removed) return 'file';
  return null;
};

export { refusalOf };
