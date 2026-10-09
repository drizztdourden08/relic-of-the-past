/* @layer shared-game @kind logic */
const computeOverlap = (tilesA: number[], tilesB: number[]): number[] => {
  const setB = new Set(tilesB);
  return tilesA.filter(t => setB.has(t));
};

export { computeOverlap };
