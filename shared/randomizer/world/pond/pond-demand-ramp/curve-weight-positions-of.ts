/* @layer shared-game @kind logic */
import { weightPositions } from './weight-positions';
import type { CurveShape } from '../../capacity/capacity-profile.type';

const curveWeightPositionsOf = (shape: CurveShape, count: number): readonly number[] =>
  (count <= 1 ? Array<number>(count).fill(0) : weightPositions(shape, count));

export { curveWeightPositionsOf };
