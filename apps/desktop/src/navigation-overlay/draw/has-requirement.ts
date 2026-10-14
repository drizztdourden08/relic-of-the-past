/* @layer renderer-components @kind logic */
const hasRequirement = (reqGrid: string[][] | undefined, row: number, col: number): boolean => (
  reqGrid !== undefined && reqGrid[row]?.[col] !== ''
);

export { hasRequirement };
