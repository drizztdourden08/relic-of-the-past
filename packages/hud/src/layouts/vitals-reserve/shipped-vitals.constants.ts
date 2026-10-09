/* @layer shared-hud @kind constants */
import { vitalsReserve } from './vitals-reserve';
import type { Rect } from '../geometry.type';

const VITALS_RESERVE: Rect = vitalsReserve();

export { VITALS_RESERVE };
