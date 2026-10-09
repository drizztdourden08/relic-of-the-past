/* @layer renderer-components @kind logic */
import { CELL_MIN } from './lattice-geometry.constants';

const trackTemplate = (sizes: readonly number[], count: number, lead: number): string => {
  const shares = Array.from({ length: count }, (_unused, i) => Math.max(0, sizes[i] ?? 0));
  const flat = shares.every((share) => share <= 0);
  const cells = shares.map((share) => `minmax(${CELL_MIN}px, ${flat ? 1 : share}fr)`);
  return `${lead}px ${cells.join(' ')}`;
};

export { trackTemplate };
