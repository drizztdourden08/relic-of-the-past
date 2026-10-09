/* @layer shared-game @kind logic */
import { CURVE_IDS } from '../curves/curves.data';
import { isValidFreeSequence, parseFreeJumps } from '../curves/free-sequence';
import { capacityFieldsOf, capacityKeyOf } from '../capacity-option-keys';
import type { CapacityFamily } from '../capacity-family';
import type { CurveId, CurveShape } from '../capacity-profile.type';
import type { PartialOptionValues } from '../../options.type';

const curveShapeOf = (capacityFamily: CapacityFamily, values: PartialOptionValues, span: number, notes: string[]): CurveShape => {
  if (!capacityFieldsOf(capacityFamily.id).includes('curve')) return { curve: 'equal' };
  const curve = values[capacityKeyOf(capacityFamily.id, 'curve')];
  if (curve === 'free') {
    const jumps = parseFreeJumps(String(values[capacityKeyOf(capacityFamily.id, 'jumps')] ?? ''));
    if (jumps !== undefined && isValidFreeSequence(jumps, span, capacityFamily.maxJump)) return { curve: 'free', jumps };
    const reason = jumps?.some((jump) => jump > capacityFamily.maxJump)
      ? `carries a jump above ${capacityFamily.maxJump}`
      : `does not sum to the span ${span}`;
    notes.push(`${capacityFamily.id}: the free sequence ${reason}, using equal`);
    return { curve: 'equal' };
  }
  if ((CURVE_IDS as readonly string[]).includes(String(curve))) return { curve: curve as CurveId };
  if (curve !== undefined) notes.push(`${capacityFamily.id}: unknown curve ${String(curve)}, using equal`);
  return { curve: 'equal' };
};

export { curveShapeOf };
