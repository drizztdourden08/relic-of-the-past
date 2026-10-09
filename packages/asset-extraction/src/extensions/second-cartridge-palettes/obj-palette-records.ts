/* @layer shared-asset-extraction @kind logic */
import { OBJ_PALETTE_ROWS } from './second-cartridge-palettes.constants';

const objPaletteRecords = (): Buffer => Buffer.concat(OBJ_PALETTE_ROWS.map(({ row, colors }) => {
  const record = Buffer.alloc(1 + colors.length * 2);
  record[0] = row;
  colors.forEach((color, i) => record.writeUInt16LE(color, 1 + i * 2));
  return record;
}));

export { objPaletteRecords };
