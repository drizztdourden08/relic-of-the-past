/* @layer renderer-lib @kind logic */
import { expandChannel } from './expand-channel';
import { BLUE_SHIFT, GREEN_SHIFT, OPAQUE_ALPHA } from './snes-color.constants';

const bgr555ToRgba = (word: number): number => {
  const r = expandChannel(word);
  const g = expandChannel(word >> GREEN_SHIFT);
  const b = expandChannel(word >> BLUE_SHIFT);
  return (OPAQUE_ALPHA << 24) | (b << 16) | (g << 8) | r;
};

export { bgr555ToRgba };
