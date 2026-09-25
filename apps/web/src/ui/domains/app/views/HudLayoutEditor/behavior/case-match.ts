/* @layer renderer-components @kind logic */
/**
 * WHICH CASE IS WINNING RIGHT NOW, for the data the stage is previewing.
 *
 * A `switch` is the one place in this editor where the ORDER IS THE LOGIC and
 * the reader cannot see the logic run. Today the panel prints `item >= 4` and
 * the stage draws a half heart, and joining those two facts is arithmetic done
 * in the author's head against a scope they have to remember. This answers it
 * where the cases are listed.
 *
 * IT IS THE ENGINE'S OWN READING, NOT A SECOND ONE. `gateTruthy` is
 * `engine/motion.ts`'s exported predicate, which is the same non-zero rule
 * `engine/expand.ts` picks a winner with, so the marker cannot drift from
 * what the stage actually drew. A `when` that does not compile resolves to 0
 * and does not match, exactly as expansion treats it.
 *
 * INSIDE A REPEAT THERE IS NO SINGLE ANSWER, AND IT SAYS SO. Every heart in
 * this project is a switch inside a repeat, so the honest report is a COUNT of
 * the instances each case wins. It reads `matches 6 of 20`, and `matches now` is
 * reserved for the unambiguous single-scope case. Reporting the first
 * instance's winner as "the" winner would be `InstanceStrip`'s own complaint
 * (a sample of size one presented as an answer) in a different section.
 */
import { gateTruthy } from '@shared/hud/engine';
import type { HudSwitchCase } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

/** `-1` stands for `otherwise`, which wins when no case does. */
const OTHERWISE = -1;

/** The index of the first case that matches in ONE scope, or `OTHERWISE`. */
const winnerIn = (cases: readonly HudSwitchCase[], scope: Scope): number => {
  const at = cases.findIndex((c) => gateTruthy(c.when, scope));
  return at === -1 ? OTHERWISE : at;
};

interface CaseMatches {
  /** How many previewed scopes each case wins, indexed as `cases` is. */
  wins: readonly number[];
  /** How many end up at `otherwise`. */
  otherwise: number;
  /** How many scopes were read at all. That is 1 outside a repeat and `count` inside. */
  total: number;
}

/**
 * @param scopes one scope outside a repeat, or the enclosing repeat's own
 *   per-instance scopes. An EMPTY list means nothing is known (no provider, or
 *   a repeat whose count resolves to 0) and nothing is marked.
 */
const caseMatches = (cases: readonly HudSwitchCase[], scopes: readonly Scope[]): CaseMatches => {
  const wins = cases.map(() => 0);
  let otherwise = 0;
  scopes.forEach((scope) => {
    const at = winnerIn(cases, scope);
    if (at === OTHERWISE) otherwise += 1;
    else wins[at] += 1;
  });
  return { wins, otherwise, total: scopes.length };
};

/** The marker's own words, or `null` when this branch never wins. */
const matchLabel = (wins: number, total: number): string | null => {
  if (wins === 0) return null;
  return total === 1 ? 'matches now' : `matches ${wins} of ${total}`;
};

export { caseMatches, matchLabel, OTHERWISE, winnerIn };
export type { CaseMatches };
