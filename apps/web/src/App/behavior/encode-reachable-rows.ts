/* @layer renderer-appshell @kind logic */
const encodeReachableRows = (reachable: number[][]): string[] =>
  reachable.map(row => row.map(v => v.toString(36)).join(''));

export { encodeReachableRows };
