/* @layer renderer-components @kind component */
/**
 * The drag image for a column: its name over its first few values. A real
 * element parked offscreen, because `setDragImage` needs a node already laid
 * out when `dragstart` fires. Values go through the field kit, the same route
 * the real cells take.
 */
import { forwardRef } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { cellContent } from '../behavior/cell-content';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

interface ColumnDragGhostProps {
  label: string;
  /** The column's dot-path. Every real cell in it reads the same way. */
  path: string;
  field?: FieldDescriptor;
  /** Rows sampled off the top of the rendered order; already capped. */
  rows: readonly unknown[];
  /** How many rows the column holds, so the strip can own up to what it left out. */
  total: number;
}

const ColumnDragGhost = forwardRef<HTMLElement, ColumnDragGhostProps>((props, ref) => {
  const { label, path, field, rows, total } = props;
  const rest = Math.max(0, total - rows.length);

  return (
    <Box ref={ref} className="data-table__drag-ghost" aria-hidden="true">
      <Box className="data-table__drag-ghost-head">
        <Text className="data-table__drag-ghost-grip">⠿</Text>
        <Text variant="label" className="data-table__drag-ghost-label">{label}</Text>
      </Box>
      {rows.map((row, index) => (
        <Box key={`${path}#${index}`} className="data-table__drag-ghost-cell">
          {cellContent(row, path, field)}
        </Box>
      ))}
      {rest > 0 && <Text className="data-table__drag-ghost-rest">{`+${rest} more`}</Text>}
    </Box>
  );
});

export { ColumnDragGhost };
export type { ColumnDragGhostProps };
