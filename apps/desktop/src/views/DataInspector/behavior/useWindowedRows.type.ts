/* @layer renderer-app @kind types */
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { InspectorRow, TableOrder } from '../DataInspector.type';

interface WindowedRowsParams {
  rows: readonly InspectorRow[];
  schema: readonly FieldDescriptor[];
  order: TableOrder;
  selectedId: string | null;
  getId: (row: InspectorRow) => string;
  enabled: boolean;
}

interface LimitState {
  rows: readonly InspectorRow[];
  limit: number;
}

export type { LimitState, WindowedRowsParams };
