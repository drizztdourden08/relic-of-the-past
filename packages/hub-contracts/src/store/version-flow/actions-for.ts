/* @layer shared-store @kind logic */
import { canAct } from './can-act';
import { VERSION_FLOW } from './version-flow.constants';
import type { Actor, FlowVersion, VersionAction } from './version-flow.type';

const actionsFor = (version: FlowVersion, actors: readonly Actor[]): VersionAction[] =>
  (Object.keys(VERSION_FLOW[version.review.state]) as VersionAction[]).filter((action) => canAct(version, action, actors));

export { actionsFor };
