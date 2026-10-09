/* @layer renderer-app @kind logic */
import type { ViewKey } from '@drizztdourden08/tessera/data';
import type { InspectorKind } from '../DataInspector.type';

const tableViewKey = (kind: InspectorKind): ViewKey => `data-inspector:${kind}`;

export { tableViewKey };
