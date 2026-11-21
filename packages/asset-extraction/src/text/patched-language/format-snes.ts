/* @layer shared-asset-extraction @kind logic */
import { linearToSnes } from '../../rom/snes-address';

const formatSnes = (linear: number): string => {
  const snes = linearToSnes(linear);
  const bank = (snes >>> 16).toString(16).toUpperCase().padStart(2, '0');
  const offset = (snes & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `$${bank}:${offset}`;
};

export { formatSnes };
