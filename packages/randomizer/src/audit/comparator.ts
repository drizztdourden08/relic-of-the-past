/* @layer shared-game @kind logic */
import { chestAddressToTableIndex } from './chest-address-to-table-index';
import { joinCrosswalk } from './join-crosswalk';
import { vanillaVerdict } from './comparator-vanilla';
import type { CheckRecord } from '@rotp/game-data';
import type { ReferenceLocation } from './reference-source.type';
import type { ChestLookups, ChestPosition, ChestVerdict, ComparatorInput } from './comparator.type';
import type { RomCensus, RomChest } from './rom-census/rom-census.type';

const chestAt = (
  census: RomCensus,
  roomId: number | undefined,
  chestIndex: number | undefined,
): RomChest | undefined =>
  roomId === undefined || chestIndex === undefined
    ? undefined
    : census.chestsByRoom.get(roomId)?.find((chest) => chest.chestIndex === chestIndex);

const referencePositionOf = (
  standardName: string,
  referenceByName: ReadonlyMap<string, ReferenceLocation>,
  flatTable: readonly { roomId: number }[],
): { roomId: number; chestIndex: number } | null => {
  const location = referenceByName.get(standardName);
  if (location === undefined) return null;
  const tableIndex = chestAddressToTableIndex(location.romAddress);
  return tableIndex === null ? null : joinCrosswalk(tableIndex, flatTable);
};

const phantomVerdict = (
  check: CheckRecord, standardName: string, census: RomCensus,
): ChestVerdict | null => {
  const { roomId, chestIndex } = check.gameId;
  if (chestAt(census, roomId, chestIndex) !== undefined) return null;
  return {
    checkId: check.id,
    standardName,
    verdict: 'phantom-chest',
    actual: { roomId, chestIndex },
    note: 'no native chest-table entry at the dataset (roomId, chestIndex)',
  };
};

const missingReferenceVerdict = (
  check: CheckRecord, standardName: string, referenceByName: ReadonlyMap<string, ReferenceLocation>,
): ChestVerdict => ({
  checkId: check.id,
  standardName,
  verdict: 'no-reference-address',
  note: referenceByName.has(standardName)
    ? 'reference location exists but its address is outside the chest-table range'
    : 'no reference location with this standard name',
});

const mismatchVerdict = (
  check: CheckRecord, standardName: string, expected: ChestPosition, actual: ChestPosition,
): ChestVerdict => ({
  checkId: check.id,
  standardName,
  verdict: 'position-mismatch',
  expected,
  actual,
});

const verdictsForChest = (
  check: CheckRecord,
  standardName: string,
  input: ComparatorInput,
  lookups: ChestLookups,
): ChestVerdict[] => {
  const { census, flatTable, items } = input;
  const out: ChestVerdict[] = [];
  const { roomId, chestIndex } = check.gameId;

  const phantom = phantomVerdict(check, standardName, census);
  if (phantom !== null) out.push(phantom);

  const referencePosition = referencePositionOf(standardName, lookups.referenceByName, flatTable);
  const positionMismatch =
    referencePosition !== null && (referencePosition.roomId !== roomId || referencePosition.chestIndex !== chestIndex);
  if (referencePosition === null) {
    out.push(missingReferenceVerdict(check, standardName, lookups.referenceByName));
  } else if (positionMismatch) {
    out.push(mismatchVerdict(check, standardName, referencePosition, { roomId, chestIndex }));
  }

  const finalPosition = positionMismatch ? referencePosition : { roomId, chestIndex };
  const finalChest = chestAt(census, finalPosition.roomId, finalPosition.chestIndex);
  if (finalChest !== undefined) {
    const verdict = vanillaVerdict({
      checkId: check.id,
      standardName,
      censusByte: finalChest.itemByte,
      vanillaItemIds: check.vanillaItemIds,
      items,
      itemById: lookups.itemById,
    });
    if (verdict !== null) out.push(verdict);
  }

  if (out.length === 0) out.push({ checkId: check.id, standardName, verdict: 'ok' });
  return out;
};

const keyDropVerdict = (
  check: CheckRecord,
  standardName: string,
  referenceLocationIds: Record<string, number>,
): ChestVerdict =>
  standardName in referenceLocationIds
    ? { checkId: check.id, standardName, verdict: 'ok' }
    : {
        checkId: check.id,
        standardName,
        verdict: 'no-reference-address',
        note: 'keydrop name not in datapackage',
      };

const compareChestChecks = (input: ComparatorInput): ChestVerdict[] => {
  const { checks, items, referenceLocations, referenceLocationIds, nameOf } = input;
  const itemById = new Map(items.map((item) => [item.id, item]));
  const referenceByName = new Map(referenceLocations.map((location) => [location.name, location]));

  const verdicts: ChestVerdict[] = [];
  for (const check of checks) {
    if (check.kind === 'keyDrop') {
      verdicts.push(keyDropVerdict(check, nameOf(check), referenceLocationIds));
      continue;
    }
    if (check.kind !== 'chest') continue;
    verdicts.push(...verdictsForChest(check, nameOf(check), input, { referenceByName, itemById }));
  }
  return verdicts;
};

export { compareChestChecks };
