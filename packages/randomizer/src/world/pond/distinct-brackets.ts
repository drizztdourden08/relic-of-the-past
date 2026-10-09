/* @layer shared-game @kind logic */
const distinctBrackets = (positions: readonly number[], count: number): number[] => {
  const rungs = positions.length;
  if (count <= 0) return [];
  if (rungs > count) return positions.map((_, index) => Math.min(count - 1, Math.floor((index * count) / rungs)));
  let previous = -1;
  return positions.map((position, index) => {
    const wanted = Math.round(position * (count - 1));
    const highest = count - 1 - (rungs - 1 - index);
    previous = Math.min(highest, Math.max(previous + 1, wanted));
    return previous;
  });
};

export { distinctBrackets };
