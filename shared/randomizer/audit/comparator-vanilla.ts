/* @layer shared-game @kind logic */
/**
 * Vanilla-item side of the comparator: resolves a check's declared vanilla
 * item to a native receive-item id and judges it against the census byte.
 *
 * Decomp ruling (established): the chest-table item byte and the receive-item
 * index are the SAME id space (identity pass-through; the owned-duplicate
 * alternates 0x0C→0x44, 0x12→0x35, 0x2A→0x46 apply only when already owned).
 * A dataset check whose resolved receive id differs from the census byte at
 * its position is therefore a dataset-side vanilla-item error, unless it is
 * exactly the alternate pair of the byte, which is still wrong for override
 * matching but is classified separately as 'vanilla-alt-id'.
 */
import type { ItemRecord } from '../../game/data/types';
import type { ChestVerdict } from './comparator-types';

const ALTERNATE_PAIRS: readonly (readonly [number, number])[] = [
  [0x0c, 0x44],
  [0x12, 0x35],
  [0x2a, 0x46],
];

const alternateOf = (byte: number): number | null => {
  for (const [a, b] of ALTERNATE_PAIRS) {
    if (byte === a) return b;
    if (byte === b) return a;
  }
  return null;
};

const hex = (byte: number | null): string =>
  byte === null ? 'none' : `0x${byte.toString(16).padStart(2, '0')}`;

interface VanillaResolution {
  itemId: string | null;
  receiveItemId: number | null;
}

/** First declared vanilla item → its record → aliasOf one hop → receive id. */
const resolveVanillaReceiveId = (
  vanillaItemIds: readonly string[],
  itemById: ReadonlyMap<string, ItemRecord>,
): VanillaResolution => {
  const firstId = vanillaItemIds[0];
  if (firstId === undefined) return { itemId: null, receiveItemId: null };
  const item = itemById.get(firstId);
  if (item === undefined) return { itemId: firstId, receiveItemId: null };
  const direct = item.gameId?.receiveItemId;
  if (direct !== undefined) return { itemId: firstId, receiveItemId: direct };
  const alias = item.aliasOf === undefined ? undefined : itemById.get(item.aliasOf);
  return { itemId: firstId, receiveItemId: alias?.gameId?.receiveItemId ?? null };
};

/** Verdict for one chest's vanilla item, or null when it matches exactly. */
const vanillaVerdict = (
  input: {
    checkId: string;
    standardName: string;
    censusByte: number;
    vanillaItemIds: readonly string[];
    items: readonly ItemRecord[];
    itemById: ReadonlyMap<string, ItemRecord>;
  },
): ChestVerdict | null => {
  const { checkId, standardName, censusByte, vanillaItemIds, items, itemById } = input;
  const resolution = resolveVanillaReceiveId(vanillaItemIds, itemById);
  if (resolution.receiveItemId === censusByte) return null;

  const base = {
    checkId,
    standardName,
    expected: { vanillaByte: censusByte },
    actual: { vanillaByte: resolution.receiveItemId ?? undefined },
  };

  if (resolution.receiveItemId !== null && alternateOf(censusByte) === resolution.receiveItemId) {
    return {
      ...base,
      verdict: 'vanilla-alt-id',
      note: `dataset item '${resolution.itemId}' resolves to ${hex(resolution.receiveItemId)}, the owned-duplicate alternate of the census byte ${hex(censusByte)}`,
    };
  }

  const carrier = items.find((item) => item.gameId?.receiveItemId === censusByte)?.id ?? null;
  const note = carrier === null
    ? `no item record carries receive id ${hex(censusByte)} (dataset item '${resolution.itemId}' resolves to ${hex(resolution.receiveItemId)})`
    : `census byte ${hex(censusByte)} is carried by item '${carrier}'; dataset item '${resolution.itemId}' resolves to ${hex(resolution.receiveItemId)}`;
  return { ...base, verdict: 'vanilla-wrong', note };
};

export { alternateOf, resolveVanillaReceiveId, vanillaVerdict };
export type { VanillaResolution };
