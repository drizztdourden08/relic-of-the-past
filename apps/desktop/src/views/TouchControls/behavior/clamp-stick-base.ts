/* @layer renderer-app @kind logic */
import type { TouchRect } from '@rotp/features';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';

const clampRange = (value: number, low: number, high: number): number =>
  low > high ? (low + high) / 2 : Math.min(high, Math.max(low, value));

const clampStickBase = (point: PxPoint, zone: TouchRect, radiusPx: number, box: ScreenBox): PxPoint => ({
  x: clampRange(point.x, zone.x * box.width + radiusPx, (zone.x + zone.w) * box.width - radiusPx),
  y: clampRange(point.y, zone.y * box.height + radiusPx, (zone.y + zone.h) * box.height - radiusPx),
});

export { clampStickBase };
