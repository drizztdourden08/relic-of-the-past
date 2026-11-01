/* @layer tests @kind helper */
import type { SimObservation, FlagSnapshot } from '@rotp/navigation';
import { baseObs as baseObsOn } from '../base-obs';

const baseObs = (flags: FlagSnapshot): SimObservation => baseObsOn('A', flags);

export { baseObs };
