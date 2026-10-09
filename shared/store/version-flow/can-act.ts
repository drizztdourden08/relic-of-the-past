/* @layer shared-store @kind logic */
import { refusalOf } from './refusal-of';
import type { Actor, FlowVersion, VersionAction } from './version-flow.type';

const canAct = (version: FlowVersion, action: VersionAction, actors: readonly Actor[]): boolean =>
  refusalOf(version, action, actors) === null;

export { canAct };
