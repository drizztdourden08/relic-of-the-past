/* @layer renderer-components @kind component */
/**
 * THE DRAWING: one cell per child, in flow order, at the proportions the engine
 * actually gave them (§58).
 *
 * IT IS THE LATTICE'S CLAIM, ON A LINE. "Cells should match in size to the row
 * and column" is what made the grid's lattice read the stage's own solve instead
 * of drawing squares; a flex container's cells earn the same claim more cheaply,
 * because a flex container has no lattice to solve. Where the children were
 * PLACED is the arrangement (§57.5). So each cell's `flex-grow` is its child's
 * real placed size along the flow, entered exactly the way the lattice enters
 * its track weights, over a `--flex-cell-min` floor so a zero-sized child is
 * still a thing you can press.
 *
 * IT IS DRAWN THE WAY THE CONTAINER IS DRAWN. `flex-direction` is the
 * container's own `direction` and `flex-wrap` its own `wrap`, so a column's
 * children stack in the panel exactly as they stack on the stage and a wrapping
 * row wraps here too. A strip that always ran left-to-right would be a picture
 * of a different container.
 *
 * ONE TAB STOP, AND THE CURSOR IS `aria-activedescendant`. A `<Button>` per
 * child would make a six-child row six stops on the way to the legend; the strip
 * itself takes the focus and the arrows move inside it, which is the lattice's
 * own arrangement for the same reason.
 *
 * A PRESS WRITES NOTHING. Everything here is `onPointerDown` into a selection
 * hook; the document is byte-identical after any number of clicks.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import './HudLayoutEditor.flex.css';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { FlowDirection } from '../../../behavior/align-options';

interface FlexCell {
  id: string;
  /** The child's placed size along the flow, in game px. `0` for a child that
   *  is not on the stage right now, which the strip reads as "no proportion
   *  known" and draws at an equal share. */
  weight: number;
  selected: boolean;
}

interface FlexStripProps {
  cells: readonly FlexCell[];
  direction: FlowDirection;
  wrap: boolean;
  cursor: number;
  label: string;
  onCellDown: (index: number, event: ReactPointerEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

const idOf = (index: number): string => `hud-flex-cell-${index}`;

/** Equal shares when nothing has a size yet. That honestly says "no proportions
 *  known" instead of guessing, and it is the same fallback the lattice makes. */
const weightsOf = (cells: readonly FlexCell[]): number[] => {
  const total = cells.reduce((sum, cell) => sum + Math.max(cell.weight, 0), 0);
  return cells.map((cell) => (total > 0 ? Math.max(cell.weight, 0) : 1));
};

const FlexStrip = (props: FlexStripProps) => {
  const { cells, direction, wrap, cursor, label, onCellDown, onKeyDown } = props;
  const weights = weightsOf(cells);

  return (
    <Box
      className="hud-flex-strip"
      role="listbox"
      aria-multiselectable
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={cells.length > 0 ? idOf(cursor) : undefined}
      data-flow={direction}
      data-wrap={wrap ? 'true' : undefined}
      onKeyDown={onKeyDown}
    >
      {cells.length === 0 && (
        <Text className="hud-flex-strip__empty">no children yet</Text>
      )}
      {cells.map((cell, index) => (
        <Box
          key={cell.id}
          id={idOf(index)}
          className="hud-flex-strip__cell"
          role="option"
          aria-selected={cell.selected}
          data-index={index}
          data-state={cell.selected ? 'selected' : 'idle'}
          data-cursor={cursor === index ? 'true' : undefined}
          title={`${cell.id} is item ${index + 1}`}
          style={{ '--hud-flex-weight': weights[index] } as CSSProperties}
          onPointerDown={(event) => onCellDown(index, event)}
        >
          <Text className="hud-flex-strip__label">{cell.id}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { FlexStrip, idOf, weightsOf };
export type { FlexCell, FlexStripProps };
