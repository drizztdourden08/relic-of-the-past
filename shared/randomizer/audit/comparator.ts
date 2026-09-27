/* @layer shared-game @kind logic */
/**
 * S3 comparator: pure cross-check of every dataset chest check against the
 * ROM census (S1) and the reference project's location table (S2).
 *
 * Per chest check it can emit up to TWO verdicts (position + vanilla item);
 * 'ok' is emitted only when nothing else was. Key-drop checks are judged for
 * datapackage name coverage only.
 */
import { chestAddressToTableIndex, joinCrosswalk } from './chest-crosswalk';
import { vanillaVerdict } from './comparator-vanilla';
import type { CheckRecord, ItemRecord } from '../../game/data/types';
import type { ReferenceLocation } from './reference-source';
import type { ChestVerdict, ComparatorInput } from './comparator-types';
import type { RomCensus, RomChest } from './rom-census';

const chestAt = (
  census: RomCensus,
  roomId: number | undefined,
  chestIndex: number | undefined,
): RomChest | undefined =>
  roomId === undefined || chestIndex === undefined
    ? undefined
    : census.chestsByRoom.get(roomId)?.find((chest) => chest.chestIndex === chestIndex);

/** The reference-side (roomId, chestIndex) for a standard name, when it maps into the chest table. */
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

const verdictsForChest = (
  check: CheckRecord,
  standardName: string,
  input: ComparatorInput,
  referenceByName: ReadonlyMap<string, ReferenceLocation>,
  itemById: ReadonlyMap<string, ItemRecord>,
): ChestVerdict[] => {
  const { census, flatTable, items } = input;
  const out: ChestVerdict[] = [];
  const { roomId, chestIndex } = check.gameId;

  const datasetChest = chestAt(census, roomId, chestIndex);
  if (datasetChest === undefined) {
    out.push({
      checkId: check.id,
      standardName,
      verdict: 'phantom-chest',
      actual: { roomId, chestIndex },
      note: 'no native chest-table entry at the dataset (roomId, chestIndex)',
    });
  }

  const referencePosition = referencePositionOf(standardName, referenceByName, flatTable);
  const positionMismatch =
    referencePosition !== null && (referencePosition.roomId !== roomId || referencePosition.chestIndex !== chestIndex);
  if (referencePosition === null) {
    out.push({
      checkId: check.id,
      standardName,
      verdict: 'no-reference-address',
      note: referenceByName.has(standardName)
        ? 'reference location exists but its address is outside the chest-table range'
        : 'no reference location with this standard name',
    });
  } else if (positionMismatch) {
    out.push({
      checkId: check.id,
      standardName,
      verdict: 'position-mismatch',
      expected: referencePosition,
      actual: { roomId, chestIndex },
    });
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
      itemById,
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
    verdicts.push(...verdictsForChest(check, nameOf(check), input, referenceByName, itemById));
  }
  return verdicts;
};

export { compareChestChecks };
export type { ChestVerdict, ComparatorInput } from './comparator-types';
