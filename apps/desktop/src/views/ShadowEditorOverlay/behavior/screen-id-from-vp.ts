/* @layer renderer-components @kind logic */
import { overworldScreenIdOf } from '@app/game';
import type { Vp } from './overlay.type';

const screenIdFromVp = (vp: Vp): number => overworldScreenIdOf(vp);

export { screenIdFromVp };
