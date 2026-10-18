/* @layer renderer-app @kind logic */
import { createSchemaIndex, deriveRows } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { InspectorRow, TableOrder } from '../DataInspector.type';

const orderedRows = (
  rows: readonly InspectorRow[],
  schema: readonly FieldDescriptor[],
  order: TableOrder,
): readonly InspectorRow[] => {
  if (!order.sort.length && !order.groupBy.length) return rows;
  return deriveRows({ rows, schema: createSchemaIndex(schema), sort: order.sort, groupBy: order.groupBy }).sortedRows;
};

export { orderedRows };
