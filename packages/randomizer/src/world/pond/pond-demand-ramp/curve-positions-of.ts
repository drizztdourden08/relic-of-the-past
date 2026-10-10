/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { rungOf } from '../pond-plan';
import { weightPositions } from './weight-positions';
import type { CurveShape } from '../../capacity/capacity-profile.type';
import type { PondPlan } from '../pond-profile.type';

const curvePositionsOf = (plan: PondPlan, shape: CurveShape): readonly number[] => {
  const count = plan.throws.length;
  if (count <= 1) return Array<number>(count).fill(0);
  const walk = plan.throws.map((entry) => rungOf(entry.price));
  const first = itemAt(walk, 0);
  const span = itemAt(walk, count - 1) - first;
  if (span <= 0) return weightPositions(shape, count);
  return walk.map((rung) => (rung - first) / span);
};

export { curvePositionsOf };
