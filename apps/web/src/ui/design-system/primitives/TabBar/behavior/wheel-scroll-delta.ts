/* @layer renderer-components @kind logic */
/**
 * How far a wheel gesture over the strip should move it sideways, or null,
 * meaning the gesture is not ours and belongs to whatever the strip sits in.
 *
 * Answering null is the important half: a strip that swallowed every wheel
 * event would trap a page scroll the moment the pointer crossed it. It is only
 * ours while the strip has somewhere left to go in the direction being asked
 * for, so the last notch at either end falls through to the page, and a strip
 * that fits its tabs never takes a gesture at all.
 *
 * A sideways gesture (a trackpad swipe) is left alone as well: the browser
 * already scrolls the strip with it, and doing it again here would only fight
 * the native momentum.
 *
 * Deltas are read as pixels, which is what this app's runtime reports.
 */
import { EDGE_EPSILON, isOverflowing, maxScrollOf } from './strip-geometry';
import type { StripMetrics } from './strip-geometry';

interface WheelGesture {
  deltaX: number;
  deltaY: number;
}

const wheelScrollDelta = (gesture: WheelGesture, metrics: StripMetrics): number | null => {
  const { deltaX, deltaY } = gesture;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) return null;
  if (!isOverflowing(metrics)) return null;

  const room = deltaY < 0
    ? -metrics.scrollLeft
    : maxScrollOf(metrics) - metrics.scrollLeft;
  if (Math.abs(room) <= EDGE_EPSILON) return null;

  return deltaY < 0 ? Math.max(deltaY, room) : Math.min(deltaY, room);
};

export { wheelScrollDelta };
export type { WheelGesture };
