/* @layer renderer-lib @kind logic */
import type { CurvePresetId } from '@rotp/randomizer';
import type { CurveChoice } from '@domains/app/compounds/CapacityFamilyRow';

const isPresetChoice = (curve: CurveChoice): curve is `preset:${CurvePresetId}` => curve.startsWith('preset:');

export { isPresetChoice };
