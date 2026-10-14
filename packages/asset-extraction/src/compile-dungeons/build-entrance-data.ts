/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { appendExtraEntrance } from '../extensions/second-cartridge-links';
import { ENTRANCE_ASSETS } from './entrance-data/entrance-data.constants';
import type { EntranceSpec } from './entrance-data/entrance-data.type';
import { readEntranceTable } from './entrance-data/read-entrance-table';

const buildEntranceData = (rom: RomData, A: AssetBuilder, spec: EntranceSpec): void => {
  const { set, prefix } = spec;
  const table = readEntranceTable(rom, spec);
  if (set === 0) appendExtraEntrance(table);
  for (const asset of ENTRANCE_ASSETS) {
    if (asset.onlySet !== undefined && asset.onlySet !== set) continue;
    A[asset.add](`${prefix}${asset.name}`, table[asset.key]);
  }
};

export { buildEntranceData };
