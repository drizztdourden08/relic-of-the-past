/* @layer renderer-components @kind logic */
const edgeAt = (n: number, span: number, cells: number): number =>
  Math.round((n * span) / cells);

export { edgeAt };
