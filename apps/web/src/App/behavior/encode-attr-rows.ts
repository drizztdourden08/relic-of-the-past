/* @layer renderer-appshell @kind logic */
const encodeAttrRows = (grid: number[][]): string[] =>
  grid.map(row => row.map(v => v.toString(16).padStart(2, '0')).join(''));

export { encodeAttrRows };
