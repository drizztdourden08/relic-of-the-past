/* @layer bridge-wasm @kind logic */
/**
 * Item lookup: resolves a community-standard item name to the receive-item
 * index the delivery layer feeds to the core, following a duplicate-alternate
 * alias one hop when the direct record has no native id. The counter upgrades
 * and the progressive families carry no native id at all: they resolve to the
 * reserved virtual ranges every grant seam translates (upgrade-receive-id /
 * progressive-receive-id contracts), so a progressive copy is mapped to its next
 * tier by the core from live inventory, never statically here. A
 * wallet upgrade name resolves to a SLOT of the session's wallet jump table
 * (session-wallet-table.ts), the table the core climbs by, so the id and
 * the grant can never disagree; outside a session it is unresolvable. A
 * dungeon-flavoured name resolves to the TARGETED id of the dungeon its own
 * record points at, so the core credits that dungeon wherever the item is
 * found; a flavoured name with no record of its own still falls back one hop
 * to the base family item. Every native id
 * leaves here range-checked: the native grant tables hold 76 entries, so an
 * id outside 0x00-0x4B resolves as undefined instead of reaching the core.
 */

import {
  asNativeReceiveId, dungeonItemReceiveIdOfRecord, findOne, getItem, prizeReceiveIdOfName,
  progressiveReceiveIdOfName, upgradeReceiveIdOfName,
} from '@shared/game/data';
import { sessionWalletTable } from './session-wallet-table';
import type { ItemId, ItemRecord } from '@shared/game/data';

const receiveIdOf = (record: ItemRecord | undefined): number | undefined => {
  if (!record) return undefined;
  if (record.gameId?.receiveItemId !== undefined) return asNativeReceiveId(record.gameId.receiveItemId);
  if (record.aliasOf !== undefined) return asNativeReceiveId(getItem(record.aliasOf).gameId?.receiveItemId);
  return undefined;
};

const byName = (name: string): ItemRecord | undefined =>
  findOne('item', (item) => item.randomizerName === name);

const resolveLocalItemId = (
  standardItemName: string, walletTable: readonly number[] = sessionWalletTable(),
): number | undefined => {
  // The ten dungeon prizes answer first: the dataset carries two records per pendant
  // name (only one of them with a native id) and none at all for the seven crystals, so
  // a record lookup is either ambiguous or empty. prize-receive-id.ts is the one answer.
  const prize = prizeReceiveIdOfName(standardItemName);
  if (prize !== undefined) return prize;
  const virtual = progressiveReceiveIdOfName(standardItemName)
    ?? upgradeReceiveIdOfName(standardItemName, walletTable);
  if (virtual !== undefined) return virtual;
  const record = byName(standardItemName);
  // A dungeon-flavoured record answers with the TARGETED id of the dungeon it belongs to
  // (dungeon-item-receive-id.ts). Its native id credits whichever dungeon the player is
  // standing in, which is only the right one while the family cannot leave its dungeon,
  // so the targeted id is used for every mode, including the baseline, where it lands on
  // exactly the same dungeon the native grant would have.
  const targeted = dungeonItemReceiveIdOfRecord(record);
  if (targeted !== undefined) return targeted;
  const direct = receiveIdOf(record);
  if (direct !== undefined) return direct;
  const flavorStart = standardItemName.indexOf(' (');
  if (flavorStart === -1 || !standardItemName.endsWith(')')) return undefined;
  return receiveIdOf(byName(standardItemName.slice(0, flavorStart)));
};

/**
 * The record id behind a standard item name, for DISPLAY (label, sprite), with no
 * native-id range check, because nothing is granted through this path. Falls
 * back the same one hop a dungeon-flavored name needs, so "Small Key (Ice
 * Palace)" still resolves to the small-key record and gets its sprite.
 */
const itemIdByStandardName = (standardItemName: string): ItemId | undefined => {
  const direct = byName(standardItemName);
  if (direct) return direct.id;
  const flavorStart = standardItemName.indexOf(' (');
  if (flavorStart === -1 || !standardItemName.endsWith(')')) return undefined;
  return byName(standardItemName.slice(0, flavorStart))?.id;
};

export { itemIdByStandardName, resolveLocalItemId };
