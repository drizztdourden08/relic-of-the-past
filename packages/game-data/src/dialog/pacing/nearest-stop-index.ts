/* @layer shared-game @kind logic */
const nearestStopIndex = (stops: readonly number[], value: number): number => {
  const [first] = stops;
  if (first === undefined) return 0;
  let best = 0;
  let bestDistance = Math.abs(first - value);
  for (const [i, stop] of stops.entries()) {
    const distance = Math.abs(stop - value);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
};

export { nearestStopIndex };
