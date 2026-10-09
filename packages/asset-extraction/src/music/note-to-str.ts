/* @layer shared-asset-extraction @kind logic */
import { kKeys } from './spc-command-tables.constants';

const noteToStr = (note: number): string => {
  if (note >= 72) {
    if (note === 72) return '-+-';
    if (note === 73) return '---';
    throw new Error(`Invalid note: ${note}`);
  }
  const octave = Math.floor(note / 12);
  const key = note % 12;
  return `${kKeys[key]}${octave + 1}`;
};

export { noteToStr };
