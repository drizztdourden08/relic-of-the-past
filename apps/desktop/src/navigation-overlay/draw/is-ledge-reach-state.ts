/* @layer renderer-components @kind logic */
const isLedgeReachState = (s: number | undefined): boolean => s !== undefined && s >= 2 && s <= 9;

export { isLedgeReachState };
