/* @layer shared-input @kind constants */
import type { DpadReading } from '../touch-logic.type';

const NEUTRAL_FRACTION = 0.25;
const SECTOR_COUNT = 8;

const SECTORS: readonly DpadReading[] = [
  { up: false, down: false, left: false, right: true },
  { up: false, down: true, left: false, right: true },
  { up: false, down: true, left: false, right: false },
  { up: false, down: true, left: true, right: false },
  { up: false, down: false, left: true, right: false },
  { up: true, down: false, left: true, right: false },
  { up: true, down: false, left: false, right: false },
  { up: true, down: false, left: false, right: true },
];

const NEUTRAL: DpadReading = { up: false, down: false, left: false, right: false };

export { NEUTRAL, NEUTRAL_FRACTION, SECTOR_COUNT, SECTORS };
