/* @layer renderer-lib @kind logic */
import { CHANNEL_MAX } from './snes-color.constants';

const quantizeChannel = (v: number): number => (v >> 3) & CHANNEL_MAX;

export { quantizeChannel };
