/* @layer shared-game @kind logic */
import { CURVES } from '../../capacity/curves/curves.constants';
import type { CurveShape } from '../../capacity/capacity-profile.type';

const spread = (positions: readonly number[], count: number): number[] =>
  Array.from({ length: count }, (_, index) => positions[Math.min(index, positions.length - 1)]);

const weightPositions = (shape: CurveShape, count: number): number[] => {
  const weights = shape.curve === 'free' ? shape.jumps : CURVES[shape.curve](count - 1);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let walked = 0;
  const climbed = weights.map((weight) => {
    walked += weight;
    return walked / total;
  });
  return spread([0, ...climbed], count);
};

export { weightPositions };
