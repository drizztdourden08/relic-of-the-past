/* @layer bridge-wasm @kind logic */
import { dungeonItemReceiveIdOfRecord, getItem, prizeReceiveIdOfName, progressiveReceiveIdOfName, upgradeReceiveIdOfName } from '@rotp/game-data';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { RETRO_QUIVER_GRANT_ITEM, RETRO_QUIVER_ITEM } from '@shared/randomizer/world/retro/retro-bow.data';
import { sessionWalletTable } from '../session-wallet-table';
import { flavorBaseName } from './flavor-base-name';
import { itemByName } from './item-by-name';
import { receiveIdOf } from './receive-id-of';

const resolveLocalItemId = (
  standardItemName: string, walletTable: readonly number[] = sessionWalletTable(),
): number | undefined => {
  const crystalOrPrize = prizeReceiveIdOfName(standardItemName);
  if (crystalOrPrize !== undefined) return crystalOrPrize;
  const virtual = progressiveReceiveIdOfName(standardItemName)
    ?? upgradeReceiveIdOfName(standardItemName, walletTable);
  if (virtual !== undefined) return virtual;
  if (standardItemName === itemKeyName(RETRO_QUIVER_ITEM)) return receiveIdOf(getItem(RETRO_QUIVER_GRANT_ITEM));
  const record = itemByName(standardItemName);
  const targetedAtOwnDungeon = dungeonItemReceiveIdOfRecord(record);
  if (targetedAtOwnDungeon !== undefined) return targetedAtOwnDungeon;
  const direct = receiveIdOf(record);
  if (direct !== undefined) return direct;
  const baseName = flavorBaseName(standardItemName);
  if (baseName === undefined) return undefined;
  return receiveIdOf(itemByName(baseName));
};

export { resolveLocalItemId };
