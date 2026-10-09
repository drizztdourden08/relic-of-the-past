/* @layer renderer-components @kind logic */
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export { clamp01 };
