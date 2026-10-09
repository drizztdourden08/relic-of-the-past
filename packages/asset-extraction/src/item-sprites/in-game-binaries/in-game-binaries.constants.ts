/* @layer shared-asset-extraction @kind constants */
import { buildCapacityIconsFile, CAPACITY_ICON_FAMILIES, CAPACITY_ICONS_FILE } from '../capacity-icons';
import { buildCurrencySymbolsFile, CURRENCY_SYMBOL_FILES, CURRENCY_SYMBOLS_FILE } from '../currency-symbols';
import { buildForeignIconsFile, FOREIGN_ICON_FILES, FOREIGN_ICONS_FILE } from '../foreign-icons';
import { buildGearIconsFile, GEAR_ICON_FILES, GEAR_ICONS_FILE } from '../gear-icons';
import { buildQuiverIconFile, QUIVER_ICON_FILE, QUIVER_ICON_SPRITE } from '../quiver-icon';
import type { InGameBinary } from './in-game-binaries.type';

const IN_GAME_BINARIES: readonly InGameBinary[] = [
  {
    name: CAPACITY_ICONS_FILE, files: CAPACITY_ICON_FAMILIES, build: buildCapacityIconsFile,
    failure: 'an upgrade sprite is missing or not 16×16',
  },
  {
    name: GEAR_ICONS_FILE, files: GEAR_ICON_FILES, build: buildGearIconsFile,
    failure: 'a gear sprite is missing or not 16×16',
  },
  {
    name: QUIVER_ICON_FILE, files: [QUIVER_ICON_SPRITE], build: buildQuiverIconFile,
    failure: 'the quiver sprite is missing or not 16×16',
  },
  {
    name: CURRENCY_SYMBOLS_FILE, files: CURRENCY_SYMBOL_FILES, build: buildCurrencySymbolsFile,
    failure: 'a currency sprite is missing or larger than 16×8',
  },
  {
    name: FOREIGN_ICONS_FILE, files: FOREIGN_ICON_FILES, build: buildForeignIconsFile,
    failure: 'a pool icon is missing or not 16x16',
  },
];

const IN_GAME_BINARY_FILES: readonly string[] = IN_GAME_BINARIES.map((binary) => binary.name);

export { IN_GAME_BINARIES, IN_GAME_BINARY_FILES };
