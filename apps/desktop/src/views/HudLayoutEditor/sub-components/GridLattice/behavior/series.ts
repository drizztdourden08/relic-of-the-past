/* @layer renderer-components @kind logic */
const series = (count: number): number[] => Array.from({ length: count }, (_unused, i) => i + 1);

export { series };
