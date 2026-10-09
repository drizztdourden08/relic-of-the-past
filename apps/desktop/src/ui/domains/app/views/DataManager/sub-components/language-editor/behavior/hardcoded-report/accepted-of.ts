/* @layer renderer-components @kind logic */
import type { Occurrence } from '@rotp/languages';
import type { HardcodedGroup } from './hardcoded-report.type';

const acceptedOf = (groups: HardcodedGroup[], chosen: ReadonlySet<string>): Occurrence[] =>
  groups.filter((group) => chosen.has(group.variableKey)).flatMap((group) => group.exact);

export { acceptedOf };
