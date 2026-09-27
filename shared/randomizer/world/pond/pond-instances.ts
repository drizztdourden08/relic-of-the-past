/* @layer shared-game @kind logic */
/**
 * The three fairy ponds, assembled from their own pond-slot check records.
 *
 * Each record says which pond it belongs to, which rung of that pond's ladder it is and,
 * where the pond sells one ladder per answer, which family that rung grows. The pond's own
 * name is the rest of the slot's name once the rung, and the ladder word in front of it, are
 * taken off, so a pond is never spelled twice. The room each pond sits in is on the screen
 * its records are filed under, so a lookup crosses through the screen records and never a
 * hardcoded name.
 *
 * `label` is the name of a pond, and every slot it holds is that name and a number: Waterfall
 * Fairy 1, Waterfall Fairy 2, and on up a custom pond's ladder. A pond has no sides, so no
 * slot is ever a left or a right, and a wish pond's own pair IS rungs 1 and 2 of its ladder:
 * one numbered series covers the pair and every custom prize above it. The capacity pond is
 * the exception, because it answers in two ladders, bombs and arrows, seven purchases each:
 * its two slots are rung 1 of a NAMED ladder, so a rung never loses which family it grows.
 *
 * What each slot is the only source of, and what its upgrade produces, is the generator's own
 * model and lives in pond-locks.ts.
 */
import { all } from '@shared/game/data';
import { pondSlotModelOf } from './pond-locks';
import type { CheckRecord } from '@shared/game/data';
import type { PondId, PondInstance, PondSlot } from './pond-instance.type';

/**
 * The order the panel stacks the ponds in, and the order every per-pond option key is
 * generated in. A presentation order, so it is stated here and not read off the records.
 */
const POND_IDS: readonly PondId[] = ['capacity', 'wishing', 'cursed'];

/** A pond's name: the slot's name with its ladder word and rung number taken off the end. */
const labelOf = (name: string, ladder: string | undefined): string => {
  const suffix = ladder === undefined ? '' : ` ${ladder}`;
  const stem = name.slice(0, name.lastIndexOf(' '));
  return stem.endsWith(suffix) ? stem.slice(0, stem.length - suffix.length) : stem;
};

const slotOf = (check: CheckRecord): PondSlot => {
  const ladder = check.pond?.ladder;
  return {
    key: check.id,
    rung: check.pond?.rung ?? 0,
    ...(ladder === undefined ? {} : { ladder }),
    ...pondSlotModelOf(check.id),
  };
};

/**
 * A pond's records, in the order it hands its slots over: by rung, then by record id, which
 * is what separates the capacity pond's two rung-1 ladders.
 */
const recordsOfPond = (pondId: PondId): readonly CheckRecord[] => all('check')
  .filter((check) => check.pond?.pondId === pondId)
  .sort((a, b) => (a.pond?.rung ?? 0) - (b.pond?.rung ?? 0) || a.id.localeCompare(b.id));

const instanceOf = (pondId: PondId): PondInstance => {
  const [first, second] = recordsOfPond(pondId);
  if (first === undefined || second === undefined) throw new Error(`pond with no pair of slots: ${pondId}`);
  return {
    id: pondId,
    label: labelOf(first.name, first.pond?.ladder),
    slots: [slotOf(first), slotOf(second)],
  };
};

const POND_INSTANCES: readonly PondInstance[] = POND_IDS.map(instanceOf);

const POND_INSTANCE_BY_ID: Readonly<Record<PondId, PondInstance>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pond]),
) as Readonly<Record<PondId, PondInstance>>;

const pondInstanceOf = (id: PondId): PondInstance => POND_INSTANCE_BY_ID[id];

/** The pond whose two slots the capacity families answer to (capacity-pond/). */
const CAPACITY_POND: PondInstance = POND_INSTANCE_BY_ID.capacity;

export { CAPACITY_POND, POND_IDS, POND_INSTANCES, POND_INSTANCE_BY_ID, pondInstanceOf };
