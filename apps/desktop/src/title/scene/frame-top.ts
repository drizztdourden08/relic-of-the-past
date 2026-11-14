/* @layer renderer-hud @kind logic */
import { FRAME_H, HORIZON_Y } from '@rotp/game-data';
import { linesAbovePicture } from '@rotp/game-core';

const frameTopOf = (height: number): number => {
  if (linesAbovePicture(height) === 0) return 0;
  return Math.round(((height - FRAME_H) * HORIZON_Y) / FRAME_H);
};

export { frameTopOf };
