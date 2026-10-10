/* @layer tests @kind helper */
import { loadedUsRom } from './loaded-us-rom';

const usRom = (): Buffer => {
  if (!loadedUsRom) throw new Error('no US ROM: guard the suite with describeRom');
  return loadedUsRom;
};

export { usRom };
