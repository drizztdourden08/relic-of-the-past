/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { CurveId } from '../capacity-profile.type';

const CURVE_IDS: readonly CurveId[] = ['equal', 'front', 'ramp', 'reverse-fib', 'geometric'];

const CURVE_LABELS: Readonly<Record<CurveId | 'free', Message>> = {
  equal: msg('randomizer:curve.equal'),
  front: msg('randomizer:curve.front'),
  ramp: msg('randomizer:curve.ramp'),
  'reverse-fib': msg('randomizer:curve.reverseFib'),
  geometric: msg('randomizer:curve.geometric'),
  free: msg('randomizer:curve.free'),
};

export { CURVE_IDS, CURVE_LABELS };
