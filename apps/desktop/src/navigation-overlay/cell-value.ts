/* @layer renderer-components @kind logic */
const cellValue = (grid: readonly (readonly number[])[] | undefined, row: number, col: number): number => grid?.[row]?.[col] ?? 0;

export { cellValue };
