/* @layer shared-game @kind logic */
import { CURVE_IDS } from '../../capacity/curves/curve-ids.constants';
import { isValidFreeSequence, parseFreeJumps } from '../../capacity/curves/free-sequence';
import { pondKeyOf } from '../pond-option-keys';
import type { CurveId, CurveShape } from '../../capacity/capacity-profile.type';
import type { PartialOptionValues } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';

const shapeOf = (values: PartialOptionValues, pond: PondInstance, span: number, notes: string[]): CurveShape => {
  const curve = values[pondKeyOf(pond, 'curve')];
  if (curve === 'free') {
    const jumps = parseFreeJumps(String(values[pondKeyOf(pond, 'jumps')] ?? ''));
    if (jumps !== undefined && isValidFreeSequence(jumps, span)) return { curve: 'free', jumps };
    notes.push(`${pond.label}: the free sequence does not sum to the span ${span}, using equal`);
    return { curve: 'equal' };
  }
  if ((CURVE_IDS as readonly string[]).includes(String(curve))) return { curve: curve as CurveId };
  if (curve !== undefined) notes.push(`${pond.label}: unknown curve ${String(curve)}, using equal`);
  return { curve: 'equal' };
};

export { shapeOf };
