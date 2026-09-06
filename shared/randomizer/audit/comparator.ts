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
import type { ApLocation } from './ap-source';
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
const apPositionOf = (
  standardName: string,
  apByName: ReadonlyMap<string, ApLocation>,
  flatTable: readonly { roomId: number }[],
): { roomId: number; chestIndex: number } | null => {
  const location = apByName.get(standardName);
  if (location === undefined) return null;
  const tableIndex = chestAddressToTableIndex(location.romAddress);
  return tableIndex === null ? null : joinCrosswalk(tableIndex, flatTable);
};

const verdictsForChest = (
  check: CheckRecord,
  standardName: string,
  input: ComparatorInput,
  apByName: ReadonlyMap<string, ApLocation>,
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

  const apPosition = apPositionOf(standardName, apByName, flatTable);
  const positionMismatch =
    apPosition !== null && (apPosition.roomId !== roomId || apPosition.chestIndex !== chestIndex);
  if (apPosition === null) {
    out.push({
      checkId: check.id,
      standardName,
      verdict: 'no-ap-address',
      note: apByName.has(standardName)
        ? 'reference location exists but its address is outside the chest-table range'
        : 'no reference location with this standard name',
    });
  } else if (positionMismatch) {
    out.push({
      checkId: check.id,
      standardName,
      verdict: 'position-mismatch',
      expected: apPosition,
      actual: { roomId, chestIndex },
    });
  }

  const finalPosition = positionMismatch ? apPosition : { roomId, chestIndex };
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
  apLocationIds: Record<string, number>,
): ChestVerdict =>
  standardName in apLocationIds
    ? { checkId: check.id, standardName, verdict: 'ok' }
    : {
        checkId: check.id,
        standardName,
        verdict: 'no-ap-address',
        note: 'keydrop name not in datapackage',
      };

const compareChestChecks = (input: ComparatorInput): ChestVerdict[] => {
  const { checks, items, apLocations, apLocationIds, nameOf } = input;
  const itemById = new Map(items.map((item) => [item.id, item]));
  const apByName = new Map(apLocations.map((location) => [location.name, location]));

  const verdicts: ChestVerdict[] = [];
  for (const check of checks) {
    if (check.kind === 'keyDrop') {
      verdicts.push(keyDropVerdict(check, nameOf(check), apLocationIds));
      continue;
    }
    if (check.kind !== 'chest') continue;
    verdicts.push(...verdictsForChest(check, nameOf(check), input, apByName, itemById));
  }
  return verdicts;
};

export { compareChestChecks };
export type { ChestVerdict, ComparatorInput } from './comparator-types';
