/* @layer renderer-components @kind component */
/**
 * What the cursor carries while a column is being moved: the column itself —
 * its name, then the first few values under it — drawn as a narrow strip, so
 * the gesture reads as lifting a whole column out rather than dragging a label
 * around.
 *
 * It is a real element, parked offscreen, rather than anything drawn during the
 * drag: `setDragImage` has to be handed a node that is already laid out at the
 * instant `dragstart` fires, which rules out building one in response to the
 * drag. So every header keeps one ready and hands it over on the way past.
 *
 * The values go through the field kit for the field's kind — the same route the
 * real cells take — rather than being copied out of the rendered table. A kit
 * that renders a badge renders a badge here too, and nothing interactive is
 * duplicated onto a node whose only job is to be photographed.
 *
 * The header's controls (caret, ⋯) are left out: the strip says WHICH COLUMN is
 * moving, not what can be done to it.
 */
import { forwardRef } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { cellContent } from '../behavior/cell-content';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

interface ColumnDragGhostProps {
  label: string;
  /** The column's dot-path — the same read every real cell in it does. */
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
