/* @layer shared-game @kind logic */
const nearestMultiple = (hz: number): number => Math.max(1, Math.round(hz / 60));

export { nearestMultiple };
