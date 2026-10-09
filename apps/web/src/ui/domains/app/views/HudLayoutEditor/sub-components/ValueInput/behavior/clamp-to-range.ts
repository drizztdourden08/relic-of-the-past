/* @layer renderer-components @kind logic */
const clampToRange = (n: number, min?: number, max?: number): number => {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
};

export { clampToRange };
