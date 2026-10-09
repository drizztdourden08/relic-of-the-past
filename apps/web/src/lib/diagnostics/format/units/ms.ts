/* @layer renderer-lib @kind logic */
const ms = (value: number | null): string => (value === null ? '-' : `${value.toFixed(1)} ms`);

export { ms };
