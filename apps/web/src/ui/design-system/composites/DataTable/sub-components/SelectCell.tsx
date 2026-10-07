/* @layer renderer-components @kind component */
/**
 * The leading checkbox of a selectable table: one per row, and one in the header over
 * the shown rows. A click here never reaches the row, so it never opens it. Shift held
 * on the press asks for a range, which the box's own change event cannot say.
 */
import { useRef } from 'react';
import { Box } from '../../../primitives/Box';
import { Checkbox } from '../../../primitives/Checkbox';
import type { MouseEvent, PointerEvent } from 'react';
import './SelectCell.css';

interface SelectCellProps {
  role: 'gridcell' | 'columnheader';
  checked: boolean;
  indeterminate?: boolean;
  ariaLabel: string;
  onToggle: (range: boolean) => void;
}

const stop = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

const SelectCell = (props: SelectCellProps) => {
  const { role, checked, indeterminate = false, ariaLabel, onToggle } = props;
  const shiftRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    shiftRef.current = event.shiftKey;
  };

  const handleChange = () => {
    const range = shiftRef.current;
    shiftRef.current = false;
    onToggle(range);
  };

  return (
    <Box role={role} className="data-table__select" onPointerDown={handlePointerDown} onClick={stop}>
      <Checkbox checked={checked} indeterminate={indeterminate} ariaLabel={ariaLabel} onChange={handleChange} />
    </Box>
  );
};

export { SelectCell };
export type { SelectCellProps };
