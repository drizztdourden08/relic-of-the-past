/* @layer shared-game @kind logic */
import type { DialogTextureSpeed } from './box-style.type';

const textureSpeedFactor = (speed: DialogTextureSpeed): number =>
  speed === 'slow' ? 0.5 : speed === 'fast' ? 2 : 1;

export { textureSpeedFactor };
