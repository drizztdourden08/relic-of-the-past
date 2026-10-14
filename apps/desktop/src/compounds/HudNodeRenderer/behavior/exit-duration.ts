/* @layer renderer-hud @kind logic */
import type { PlacedNode } from '@rotp/hud';
import { transitionDuration } from './transition-duration';
import { transitionSpecOf } from './transition-spec';

const exitDuration = (placed: PlacedNode): number => transitionDuration(transitionSpecOf(placed, false));

export { exitDuration };
