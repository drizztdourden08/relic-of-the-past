/* @layer shared-asset-extraction @kind logic */
import { TILE_OVERRIDE_RECORD_BYTES, WALL } from './second-cartridge-attrs.constants';
import { WALL_ART_TILES, WATER_RIM_TILES } from './wall-and-water-tiles.constants';

const tileAttrOverridesRecord = (): Buffer => {
  const overrides = [...WALL_ART_TILES, ...WATER_RIM_TILES].map(tile => ({ tile, attr: WALL }));
  const record = Buffer.alloc(overrides.length * TILE_OVERRIDE_RECORD_BYTES);
  overrides.forEach(({ tile, attr }, i) => {
    record.writeUInt16LE(tile, i * TILE_OVERRIDE_RECORD_BYTES);
    record[i * TILE_OVERRIDE_RECORD_BYTES + 2] = attr;
  });
  return record;
};

export { tileAttrOverridesRecord };
