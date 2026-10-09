/* @layer shared-input @kind logic */
import { XBOX_RUMBLE_FLOOR, XBOX_RUMBLE_GAIN } from './xbox-shape-vibration.constants';

const xboxShapeVibration = (intensity: number): number =>
  (intensity <= 0 ? 0 : Math.min(1, XBOX_RUMBLE_FLOOR + intensity * XBOX_RUMBLE_GAIN));

export { xboxShapeVibration };
