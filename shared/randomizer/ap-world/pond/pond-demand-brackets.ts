/* @layer shared-game @kind logic */
/**
 * THE BRACKETS A POND CAN ASK FOR, and how the rungs are shared out over them.
 *
 * A bracket is one distinct ask: one rupee price the plan charges, one bomb,
 * arrow or bottle count inside its row's two ends, one eligible item. Every
 * ticked row brings its own brackets, and the rungs are filled from all of
 * them together, so the throw count never depends on one row's range. A pond
 * asking only for bottles and items fills ten rungs from those two rows.
 *
 * NO REPEAT UNTIL THE BRACKETS RUN OUT. Each rung draws its kind from the rows
 * that still hold an unused bracket, and inside a kind the rungs take distinct
 * brackets in curve order. Only once every row is spent does a rung draw from
 * all of them again, and then the repeats are spread evenly: that is the
 * filler, and it only exists when the ticked rows are too narrow.
 *
 * A SINGLE CHOICE COSTS NO DRAW, as before, so a rupee-only pond rolls exactly
 * what it always rolled.
 */
import type { Rng } from '../../rng';

/** One kind per rung, each kind held to its own bracket count until all are spent. */
const shareOutKinds = <K extends string>(
  kinds: readonly K[], bracketsOf: (kind: K) => number, rungCount: number, rng: Rng,
): K[] => {
  const left = new Map(kinds.map((kind) => [kind, bracketsOf(kind)]));
  return Array.from({ length: rungCount }, () => {
    const open = kinds.filter((kind) => (left.get(kind) ?? 0) > 0);
    const from = open.length > 0 ? open : kinds;
    const kind = from[from.length === 1 ? 0 : rng.int(from.length)];
    left.set(kind, (left.get(kind) ?? 0) - 1);
    return kind;
  });
};

/**
 * One bracket index per rung of a kind, from that kind's rungs' curve
 * positions (0 to 1, in rung order) over `count` brackets. Distinct and in
 * order while the brackets suffice; spread evenly with repeats once they do not.
 */
const distinctBrackets = (positions: readonly number[], count: number): number[] => {
  const rungs = positions.length;
  if (count <= 0) return [];
  if (rungs > count) return positions.map((_, index) => Math.min(count - 1, Math.floor((index * count) / rungs)));
  let previous = -1;
  return positions.map((position, index) => {
    const wanted = Math.round(position * (count - 1));
    const highest = count - 1 - (rungs - 1 - index);
    previous = Math.min(highest, Math.max(previous + 1, wanted));
    return previous;
  });
};

export { distinctBrackets, shareOutKinds };
