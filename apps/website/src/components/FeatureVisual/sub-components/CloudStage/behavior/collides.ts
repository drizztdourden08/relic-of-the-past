/* @layer website-site @kind logic */
import { PAD_X_PX, PAD_Y_PX } from '../CloudStage.constants';
import type { CloudRect } from '../CloudStage.type';

const collides = (rect: CloudRect, placed: readonly CloudRect[]): boolean =>
  placed.some(
    (other) =>
      rect.left < other.left + other.width + PAD_X_PX &&
      rect.left + rect.width + PAD_X_PX > other.left &&
      rect.top < other.top + other.height + PAD_Y_PX &&
      rect.top + rect.height + PAD_Y_PX > other.top,
  );

export { collides };
