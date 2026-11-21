/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { bufToArr } from '../asset-builder';
import { US_SCREEN_ADDRESSES } from '../screens/addresses/us';
import { readStripeTable } from '../screens/read-stripe-table';

const buildTilemaps = (rom: RomData, A: AssetBuilder): void => {
  for (const [i, address] of US_SCREEN_ADDRESSES.menuTilemaps.entries()) {
    A.addUint8(`kBgTilemap_${i}`, bufToArr(readStripeTable(rom, address)));
  }
};

export { buildTilemaps };
