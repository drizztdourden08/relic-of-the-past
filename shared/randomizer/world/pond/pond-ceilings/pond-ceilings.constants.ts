/* @layer shared-game @kind constants */
import { pondCeilingsOf } from './pond-ceilings-of';
import type { PondCeilings } from '../pond.type';

const VANILLA_POND_CEILINGS: PondCeilings = pondCeilingsOf();

export { VANILLA_POND_CEILINGS };
