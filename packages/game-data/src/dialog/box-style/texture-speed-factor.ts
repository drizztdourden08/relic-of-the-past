/* @layer shared-game @kind logic */
import type { DialogTextureSpeed } from './box-style.type';

const textureSpeedFactor = (speed: DialogTextureSpeed): number => {
  if (speed === 'slow') return 0.5;
  if (speed === 'fast') return 2;
  return 1;
};

export { textureSpeedFactor };
