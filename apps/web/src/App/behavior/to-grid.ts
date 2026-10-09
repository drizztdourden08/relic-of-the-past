/* @layer renderer-appshell @kind logic */
const toGrid = (flat: Uint8Array): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < 64; r++) {
    grid.push(Array.from(flat.slice(r * 64, (r + 1) * 64)));
  }
  return grid;
};

export { toGrid };
