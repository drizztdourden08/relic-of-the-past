/* @layer shared-game @kind logic */
/**
 * The three codes that shape a line (row marker, scroll and wait), read in one
 * direction and written back in the other. Split and join share this module so
 * they cannot drift: whatever is recognised as an advance here is exactly what
 * gets re-emitted, which is what makes an untouched entry round-trip.
 *
 * A code only counts when it carries NO param, matching `applyCmd` in
 * `layout/box-pen.ts`: the engine's scroll and wait take no argument, so a
 * parameterised lookalike is an unrelated command and stays ordinary content.
 */
import type { Token } from '../types';
import type { LineAdvance } from './types';

/** Shifts the box up a line and parks the pen on the bottom row. */
const kScrollCommand = 'Scroll';

/** Holds the box until the player presses a button; clears nothing. */
const kWaitCommand = 'Waitkey';

const isParamlessCmd = (token: Token, name: string): boolean => (
  token.t === 'cmd' && token.param === undefined && token.name === name
);

/**
 * The advance this token starts a line with, or `undefined` when the token is
 * ordinary content. Distinct from a `null` advance, which is a real answer: a
 * line that carries no code of its own.
 */
const advanceOfToken = (token: Token): LineAdvance | undefined => {
  if (token.t === 'break') return { kind: 'row', row: token.row };
  if (isParamlessCmd(token, kScrollCommand)) return { kind: 'scroll' };
  return undefined;
};

/** A wait-for-button, the code that ends a box. */
const isWaitToken = (token: Token): boolean => isParamlessCmd(token, kWaitCommand);

/** The token an advance was read from, or null when there was no code. */
const tokenForAdvance = (advance: LineAdvance): Token | null => {
  if (advance === null) return null;
  if (advance.kind === 'row') return { t: 'break', row: advance.row };
  return { t: 'cmd', name: kScrollCommand };
};

/** The wait token a line's `endsBox` stands for. */
const waitToken = (): Token => ({ t: 'cmd', name: kWaitCommand });

export { advanceOfToken, isWaitToken, tokenForAdvance, waitToken };
