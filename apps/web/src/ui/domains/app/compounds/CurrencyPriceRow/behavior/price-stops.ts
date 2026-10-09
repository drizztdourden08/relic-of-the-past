/* @layer renderer-components @kind logic */
import { COARSE_STEP, FINE_LIMIT } from './price-stops.constants';

const stopsFor = (max: number): readonly string[] => {
  const fine = Array.from({ length: Math.min(max, FINE_LIMIT) + 1 }, (_, index) => String(index));
  if (max <= FINE_LIMIT) return fine;
  const coarse: string[] = [];
  const first = (Math.floor(FINE_LIMIT / COARSE_STEP) + 1) * COARSE_STEP;
  for (let amount = first; amount < max; amount += COARSE_STEP) coarse.push(String(amount));
  return [...fine, ...coarse, String(max)];
};

export { stopsFor };
