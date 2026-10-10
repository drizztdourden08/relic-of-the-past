/* @layer tests @kind helper */
const allReachable = (rows: number, cols: number): boolean[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => true));

export { allReachable };
