/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import { pondSlotModelOf } from '../pond-slot-model-of';
import type { CheckRecord } from '@rotp/game-data';
import type { PondId, PondInstance, PondSlot } from '../pond-instance.type';

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

export { instanceOf };
