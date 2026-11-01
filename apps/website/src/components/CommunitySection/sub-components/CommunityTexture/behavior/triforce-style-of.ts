/* @layer website-site @kind logic */
import { TEXTURE_COLUMNS, TEXTURE_ROWS } from '../CommunityTexture.constants';
import type { TriforceStyle } from '../CommunityTexture.type';
import { pseudoRandom } from './pseudo-random';

const triforceStyleOf = (row: number, col: number): TriforceStyle => {
  const seed = row * TEXTURE_COLUMNS + col;
  const xJitter = (pseudoRandom(seed, 1) - 0.5) * 3;
  const yJitter = (pseudoRandom(seed, 2) - 0.5) * 4;
  const offset = row % 2 === 1 ? 0.5 : 0;
  return {
    key: seed,
    style: {
      left: `${(col + offset) * (100 / TEXTURE_COLUMNS) + xJitter}%`,
      top: `${row * (100 / TEXTURE_ROWS) + yJitter}%`,
      width: 18 + Math.round(pseudoRandom(seed, 5) * 10),
      animationDuration: `${(5 + pseudoRandom(seed, 4) * 8).toFixed(1)}s`,
      animationDelay: `-${(pseudoRandom(seed, 3) * 10).toFixed(1)}s`,
    },
  };
};

export { triforceStyleOf };
