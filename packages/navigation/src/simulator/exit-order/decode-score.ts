/* @layer bridge-wasm @kind logic */
import type { SimExit } from '../../simulation';
import { AREA_EXIT_BIAS, HOP_STEPS, UNREACHED } from './exit-order.constants';

const decodeScore = (score: number): Pick<SimExit, 'steps' | 'stepsNote'> => {
  if (score >= UNREACHED) return {};
  if (score >= AREA_EXIT_BIAS) {
    const steps = score - AREA_EXIT_BIAS;
    return steps >= HOP_STEPS ? { stepsNote: 'other-screen' } : { steps, stepsNote: 'other-screen' };
  }
  if (score >= HOP_STEPS) return { stepsNote: 'via-hop' };
  return { steps: score };
};

export { decodeScore };
