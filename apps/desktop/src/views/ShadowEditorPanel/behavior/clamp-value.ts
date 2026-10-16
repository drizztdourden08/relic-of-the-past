/* @layer renderer-components @kind logic */
const clampValue = (n: number, min: number | undefined, max: number | undefined): number => {
  let clamped = n;
  if (min !== undefined) clamped = Math.max(min, clamped);
  if (max !== undefined) clamped = Math.min(max, clamped);
  return clamped;
};

export { clampValue };
