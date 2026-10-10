/* @layer shared-hud @kind logic */
const nextRow = (prev: readonly number[], ca: string, b: string, rowIndex: number): number[] => {
  let diag = rowIndex;
  let left = rowIndex + 1;
  const row = [left];
  for (const [j, up] of prev.slice(1).entries()) {
    const cost = ca === b[j] ? 0 : 1;
    left = Math.min(up + 1, left + 1, diag + cost);
    row.push(left);
    diag = up;
  }
  return row;
};

const editDistance = (a: string, b: string): number => {
  let prev = Array.from({ length: b.length + 1 }, (_unused, j) => j);
  let distance = b.length;
  for (const [i, ca] of a.split('').entries()) {
    prev = nextRow(prev, ca, b, i);
    distance = prev[prev.length - 1] ?? distance;
  }
  return distance;
};

export { editDistance };
