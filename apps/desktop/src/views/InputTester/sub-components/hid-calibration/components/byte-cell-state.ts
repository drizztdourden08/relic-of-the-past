/* @layer renderer-components @kind logic */
import { byteCellTitle } from './byte-cell-title';
import type { ByteCellProps, ByteCellState, ByteGridProps, BytePickMode } from './ByteGrid.type';

const pickModeOf = (stickPickMode: boolean, triggerPickMode: boolean): BytePickMode => {
  if (stickPickMode) return 'stick';
  return triggerPickMode ? 'trigger' : 'none';
};

const isBytePicked = (grid: ByteGridProps, index: number): boolean => (
  (grid.stickPickMode && grid.stickPickedBytes.includes(index)) || (grid.triggerPickMode && grid.triggerPickedByte === index)
);

const deriveByteCellState = (props: ByteCellProps): ByteCellState => {
  const { index, value, grid } = props;
  const { byteStatuses, baselineRef, excludedRef, itemsRef, activeIdxRef, inputPhaseActiveRef } = grid;
  const pickMode = pickModeOf(grid.stickPickMode, grid.triggerPickMode);
  const excluded = excludedRef.current.has(index);
  const base = baselineRef.current[index];
  const status = byteStatuses[index];
  const isPicked = isBytePicked(grid, index);
  const activeItem = inputPhaseActiveRef.current ? itemsRef.current[activeIdxRef.current] : undefined;

  return {
    delta: base !== undefined && !excluded ? value - base : 0,
    signed: status === 'stick' || status === 'trigger',
    isPicked,
    dimmed: pickMode !== 'none' && !isPicked && excluded,
    title: byteCellTitle({ index, value, status: status ?? 'unknown', pickMode, isPicked, activeItem }),
  };
};

export { deriveByteCellState };
