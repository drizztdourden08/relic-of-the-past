/* @layer renderer-components @kind logic */
const wholeSeconds = (ms: number): number => Math.max(0, Math.floor(ms / 1000));

export { wholeSeconds };
