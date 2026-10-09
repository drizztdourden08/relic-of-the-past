/* @layer shared-asset-extraction @kind logic */
import { EXTENDED_PALETTES } from './second-cartridge-palettes.constants';

const extendedPaletteRecord = (paletteId: number): Buffer | null => {
  const colors = EXTENDED_PALETTES[paletteId];
  if (!colors) return null;
  const record = Buffer.alloc(colors.length * 2);
  colors.forEach((color, i) => record.writeUInt16LE(color, i * 2));
  return record;
};

export { extendedPaletteRecord };
