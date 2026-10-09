/* @layer bridge-wasm @kind logic */
import type { SimExit } from '@shared/game/simulation';
import { UNREACHED } from './exit-order.constants';
import { decodeScore } from './decode-score';

const sortExitsByDistance = (exits: SimExit[], scores: number[]): SimExit[] =>
  exits
    .map((exit, i) => {
      const score = scores[i] ?? UNREACHED;
      return { exit: { ...exit, score, ...decodeScore(score) }, score };
    })
    .sort((a, b) => a.score - b.score)
    .map((e) => e.exit);

export { sortExitsByDistance };
