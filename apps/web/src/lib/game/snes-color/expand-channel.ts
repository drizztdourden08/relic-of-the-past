/* @layer renderer-lib @kind logic */
import { CHANNEL_MAX } from './snes-color.constants';

const expandChannel = (v: number): number => ((v & CHANNEL_MAX) << 3) | ((v & CHANNEL_MAX) >> 2);

export { expandChannel };
