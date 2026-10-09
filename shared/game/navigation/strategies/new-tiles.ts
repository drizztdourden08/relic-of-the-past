/* @layer shared-game @kind logic */
const getNewTiles = (nr: number, nc: number, dr: number, dc: number): [number, number][] => {
  if (dr === -1) return [[nr, nc], [nr, nc + 1]];
  if (dr === 1) return [[nr + 1, nc], [nr + 1, nc + 1]];
  if (dc === -1) return [[nr, nc], [nr + 1, nc]];
  return [[nr, nc + 1], [nr + 1, nc + 1]];
};

export { getNewTiles };
