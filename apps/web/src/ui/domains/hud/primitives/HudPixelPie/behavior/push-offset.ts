/* @layer renderer-hud @kind logic */
import { FULL_TURN } from '../HudPixelPie.constants';

const pushOffset = (index: number, sliceCount: number, distance: number): [number, number] => {
  const bisector = ((index + 0.5) * FULL_TURN) / Math.max(1, sliceCount);
  return [Math.round(Math.sin(bisector) * distance) + 0, Math.round(-Math.cos(bisector) * distance) + 0];
};

export { pushOffset };
