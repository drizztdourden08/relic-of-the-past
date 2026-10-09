/* @layer renderer-lib @kind logic */
const nextIndex = (random: () => number, count: number): number =>
  (count <= 1 ? 0 : Math.min(count - 1, Math.floor(random() * count)));

export { nextIndex };
