/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { BASE_PALACE_COUNT, PLACEHOLDER_MAP_TEMPLATE_PALACE } from './second-cartridge-map.constants';

const appendExtraDungeonMapRecords = (layouts: Buffer[], tiles: Buffer[]): void => {
  if (layouts.length !== BASE_PALACE_COUNT || tiles.length !== BASE_PALACE_COUNT) {
    throw new Error(`Expected ${BASE_PALACE_COUNT} dungeon map records, found ${layouts.length}/${tiles.length}`);
  }
  layouts.push(Buffer.from(itemAt(layouts, PLACEHOLDER_MAP_TEMPLATE_PALACE, 'Dungeon map layout template')));
  tiles.push(Buffer.from(itemAt(tiles, PLACEHOLDER_MAP_TEMPLATE_PALACE, 'Dungeon map tile template')));
};

export { appendExtraDungeonMapRecords };
