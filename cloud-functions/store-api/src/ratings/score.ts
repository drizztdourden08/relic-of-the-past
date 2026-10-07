/* @layer store-api @kind logic */
/** The weighted score Top rated sorts by: the average pulled toward a prior of 3.8 as if ten
 *  players had rated at that. A new item with two 5s does not outrank one with 300 ratings
 *  at 4.7, and the pull fades as ratings come in. */
const PRIOR = { mean: 3.8, weight: 10 } as const;

const weightedScore = (sum: number, count: number): number => (sum + PRIOR.mean * PRIOR.weight) / (count + PRIOR.weight);

export { weightedScore, PRIOR };
