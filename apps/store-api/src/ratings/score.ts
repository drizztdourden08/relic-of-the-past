/* @layer store-api @kind logic */
import { PRIOR } from './score.constants';

const weightedScore = (sum: number, count: number): number => (sum + PRIOR.mean * PRIOR.weight) / (count + PRIOR.weight);

export { weightedScore };
