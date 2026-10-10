/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import type { Rng } from '../../rng';

const shareOutKinds = <K extends string>(
  kinds: readonly K[], bracketsOf: (kind: K) => number, rungCount: number, rng: Rng,
): K[] => {
  const left = new Map(kinds.map((kind) => [kind, bracketsOf(kind)]));
  return Array.from({ length: rungCount }, () => {
    const open = kinds.filter((kind) => (left.get(kind) ?? 0) > 0);
    const from = open.length > 0 ? open : kinds;
    const kind = itemAt(from, from.length === 1 ? 0 : rng.int(from.length));
    left.set(kind, (left.get(kind) ?? 0) - 1);
    return kind;
  });
};

export { shareOutKinds };
