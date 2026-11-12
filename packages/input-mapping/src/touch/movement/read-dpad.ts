/* @layer shared-input @kind logic */
import type { DpadReading, PxPoint } from '../touch-logic.type';

const NEUTRAL_FRACTION = 0.25;
const SECTOR_COUNT = 8;

/** Sectors clockwise from the right, with y down: right, down-right, down, down-left, left, up-left, up, up-right. */
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

/** Reads an 8-way D-pad: neutral inside 25% of the radius, else the 45 degree sector the angle falls in. */
const readDpad = (p: PxPoint, center: PxPoint, radiusPx: number): DpadReading => {
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  if (Math.hypot(dx, dy) < radiusPx * NEUTRAL_FRACTION) return { ...NEUTRAL };
  const sector = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
  return { ...SECTORS[((sector % SECTOR_COUNT) + SECTOR_COUNT) % SECTOR_COUNT] };
};

export { readDpad };
