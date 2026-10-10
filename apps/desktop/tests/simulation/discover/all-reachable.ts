/* @layer tests @kind helper */
const allReachable = (rows: number, cols: number): boolean[][] =>
  Array.from({ length: rows }, () => new Array(cols).fill(true));

export { allReachable };
