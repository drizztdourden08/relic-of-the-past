/* @layer renderer-app @kind logic */
import type { ViewSnapshot } from '@drizztdourden08/tessera/data';
import { NO_ORDER } from '../DataInspector.constants';
import type { TableOrder } from '../DataInspector.type';

const orderOf = (snapshot: ViewSnapshot | undefined): TableOrder =>
  snapshot ? { sort: snapshot.sort, groupBy: snapshot.groupBy } : NO_ORDER;

export { orderOf };
