/* @layer renderer-app @kind logic */
import type { ViewKey } from '@drizztdourden08/tessera/data';
import type { InspectorKind } from '../DataInspector.type';

const queryViewKey = (kind: InspectorKind): ViewKey => `data-inspector-query:${kind}`;

export { queryViewKey };
