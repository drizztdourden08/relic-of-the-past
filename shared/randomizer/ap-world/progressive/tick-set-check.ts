/* @layer shared-game @kind logic */
/**
 * Whether a tick set can be rolled at all, checked BEFORE any fill runs.
 *
 * Two rungs are load-bearing under the rules this app transcribes, and
 * unticking one leaves a seed with no ending rather than a harder one. The
 * fill would find that out on its own — twenty attempts later, and only as
 * "the goal is not reachable" — so it is said here instead, once, naming the
 * rung to tick back on. That is the honest failure: no seed is handed over
 * that cannot be finished.
 *
 * The list is deliberately short, and it shrinks as stand-ins land: the blade
 * rung left it once the core grew the swordless alternatives (see the note in
 * the table below). Everything else a tick set closes off is ordinary
 * difficulty and the fill places around it; only these two end the run. They
 * stay listed as data so a rule change moves the message with it.
 */
import { familyOfId } from './progressive-families.data';
import { progressiveFamilyName, progressiveTierName } from './progressive-display-names';
import { tickedIndexesOf } from './progressive-reach';
import type { ProgressiveFamilyId, ProgressiveSetting } from './progressive.type';

interface RequiredRung {
  family: ProgressiveFamilyId;
  /** The lowest rung index that satisfies the requirement. */
  from: number;
  why: string;
}

const REQUIRED_RUNGS: readonly RequiredRung[] = [
  // The blade rung used to be listed here. It no longer is: the two places that asked for a
  // beam blade — the seal outside the tower and the last fight — now take the hammer instead
  // whenever no beam blade is reachable, and a hanging cloth door can be pulled down as well
  // as cut. Those three stand-ins are armed from the tick set itself (item-power-rule.ts), so
  // a file with no blade rung ticked at all still reaches the ending. The hammer is a plain
  // progression item that every pool carries, so nothing extra has to be checked for here.
  {
    family: 'bow',
    from: 1,
    why: 'the last fight asks for silver arrows, and nothing else can finish it',
  },
  {
    family: 'glove',
    from: 1,
    why: 'the heavy lift is the only way into several places the seed has to be able to reach',
  },
];

/** One sentence per rung a tick set has closed that the seed cannot do without. */
const unrollableTickSetReasons = (setting: ProgressiveSetting): readonly string[] =>
  REQUIRED_RUNGS.flatMap(({ family, from, why }) => {
    if (tickedIndexesOf(setting, family).some((index) => index >= from)) return [];
    const def = familyOfId(family);
    return [`${progressiveFamilyName(def)} "${progressiveTierName(def, from)}" is unticked: ${why}.`];
  });

class ProgressiveTierError extends Error {
  constructor(reasons: readonly string[]) {
    super(`no seed can be rolled from these tier ticks. ${reasons.join(' ')}`);
    this.name = 'ProgressiveTierError';
  }
}

/** Throws with every reason at once, so one message covers the whole edit. */
const assertRollableTickSet = (setting: ProgressiveSetting): void => {
  const reasons = unrollableTickSetReasons(setting);
  if (reasons.length > 0) throw new ProgressiveTierError(reasons);
};

export { ProgressiveTierError, assertRollableTickSet, unrollableTickSetReasons };
