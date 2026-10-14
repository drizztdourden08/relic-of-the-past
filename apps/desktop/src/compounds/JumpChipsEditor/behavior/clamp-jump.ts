/* @layer renderer-components @kind logic */
const clampJump = (next: number, max: number): number => (Number.isFinite(next) ? Math.min(max, next) : 0);

export { clampJump };
