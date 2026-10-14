/* @layer renderer-components @kind constants */
const BARS = { grid: 2, flex: 3 } as const;

const BAR_THICKNESS = { grid: 'var(--size-4)', flex: 'calc(3 * var(--size-1))' } as const;

const FOLD_ABOVE = 4;

export { BAR_THICKNESS, BARS, FOLD_ABOVE };
