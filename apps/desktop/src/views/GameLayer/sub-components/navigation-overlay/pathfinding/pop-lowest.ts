/* @layer renderer-components @kind logic */
const popLowest = <T>(open: T[], score: (node: T) => number): T | undefined => {
  let bestIdx = 0;
  let bestScore = Number.POSITIVE_INFINITY;
  open.forEach((node, i) => {
    const s = score(node);
    if (s < bestScore) { bestScore = s; bestIdx = i; }
  });
  return open.splice(bestIdx, 1)[0];
};

export { popLowest };
