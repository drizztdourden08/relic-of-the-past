/* @layer renderer-components @kind logic */
/**
 * Where the other columns go while one is being carried over them.
 *
 * Dropping on index `to` puts the column INTO that slot. Carried rightwards it
 * therefore lands after the hovered column, and everything from just past its
 * own slot up to and including the hovered one slides LEFT to close the hole it
 * left. Carried leftwards it lands before the hovered column, and everything
 * from the hovered one up to its own slot slides RIGHT. Either way the gap that
 * opens is exactly the slot the column will occupy.
 *
 * Pure on purpose: the direction rule is the part worth testing, and the drag
 * gesture that produces it cannot be tested without a browser.
 */

/** Which way a cell steps aside, if at all. */
type DragShift = 'none' | 'left' | 'right';

/** Which edge of the hovered cell the carried column would land against. */
type DropEdge = 'before' | 'after' | null;

interface DragShiftParams {
  /** The cell being asked about. */
  index: number;
  /** Where the carried column started, or null when nothing is being carried. */
  from: number | null;
  /** The cell currently under the cursor, or null before the first dragover. */
  over: number | null;
}

const columnDragShift = (params: DragShiftParams): DragShift => {
  const { index, from, over } = params;
  if (from === null || over === null || from === over || index === from) return 'none';
  if (over > from) return index > from && index <= over ? 'left' : 'none';
  return index >= over && index < from ? 'right' : 'none';
};

const dropEdgeAt = (params: DragShiftParams): DropEdge => {
  const { index, from, over } = params;
  if (from === null || over === null || from === over || index !== over) return null;
  return over > from ? 'after' : 'before';
};

export { columnDragShift, dropEdgeAt };
export type { DragShift, DragShiftParams, DropEdge };
