/* @layer shared-input @kind logic */
import type { DpadReading, PxPoint } from '../touch-logic.type';
import { NEUTRAL, NEUTRAL_FRACTION, SECTOR_COUNT, SECTORS } from './read-dpad.constants';

const readDpad = (p: PxPoint, center: PxPoint, radiusPx: number): DpadReading => {
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  if (Math.hypot(dx, dy) < radiusPx * NEUTRAL_FRACTION) return { ...NEUTRAL };
  const sector = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
  return { ...(SECTORS[((sector % SECTOR_COUNT) + SECTOR_COUNT) % SECTOR_COUNT] ?? NEUTRAL) };
};

export { readDpad };
