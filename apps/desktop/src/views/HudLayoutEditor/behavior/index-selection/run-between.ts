/* @layer renderer-components @kind logic */
const runBetween = (from: number, to: number): number[] => {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return Array.from({ length: hi - lo + 1 }, (_unused, i) => lo + i);
};

export { runBetween };
