/* @layer shared-game @kind logic */
import { alternateOf } from './alternate-of';
import { resolveVanillaReceiveId } from './resolve-vanilla-receive-id';
import type { ChestVerdict, VanillaVerdictInput } from './comparator.type';

const hex = (byte: number | null): string =>
  byte === null ? 'none' : `0x${byte.toString(16).padStart(2, '0')}`;

const vanillaVerdict = (input: VanillaVerdictInput): ChestVerdict | null => {
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

export { vanillaVerdict };
