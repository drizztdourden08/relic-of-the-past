/* @layer shared-game @kind logic */
const nearestStopIndex = (stops: readonly number[], value: number): number => {
  let best = 0;
  for (let i = 1; i < stops.length; i++) {
    if (Math.abs(stops[i] - value) < Math.abs(stops[best] - value)) best = i;
  }
  return best;
};

export { nearestStopIndex };
