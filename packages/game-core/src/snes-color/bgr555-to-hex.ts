/* @layer renderer-lib @kind logic */
import { expandChannel } from './expand-channel';
import { BLUE_SHIFT, GREEN_SHIFT } from './snes-color.constants';

const hexByte = (v: number): string => v.toString(16).padStart(2, '0');

const bgr555ToHex = (word: number): string => {
  const r = expandChannel(word);
  const g = expandChannel(word >> GREEN_SHIFT);
  const b = expandChannel(word >> BLUE_SHIFT);
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}`;
};

export { bgr555ToHex };
