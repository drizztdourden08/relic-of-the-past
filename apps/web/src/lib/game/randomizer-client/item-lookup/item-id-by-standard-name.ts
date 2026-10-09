/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@shared/game/data';
import { flavorBaseName } from './flavor-base-name';
import { itemByName } from './item-by-name';

const itemIdByStandardName = (standardItemName: string): ItemId | undefined => {
  const direct = itemByName(standardItemName);
  if (direct) return direct.id;
  const baseName = flavorBaseName(standardItemName);
  if (baseName === undefined) return undefined;
  return itemByName(baseName)?.id;
};

export { itemIdByStandardName };
