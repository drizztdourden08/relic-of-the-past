/* @layer shared-game @kind logic */
const bodyTiles = (r: number, c: number): [number, number][] => [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];

export { bodyTiles };
