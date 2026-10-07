/* @layer shared-game @kind constants */
/**
 * The only two substitutions the engine performs at runtime, expressed as
 * variables.
 *
 * The message renderer injects a save file's name field and ONE digit of a live
 * counter, and nothing else. There is no item-name, place-name or count
 * injection anywhere in it. So everything else a set can vary is OURS and has
 * to be expanded to literal text before the dialogue is packed. These two are
 * locked because their value comes from the running game, never from the set.
 *
 * The worst cases are the engine's, not a guess: the name field holds at most
 * `MAX_NAME_GLYPHS` glyphs, the same figure the layout planner already bills
 * it at, so a row judged safe here is safe there. The numeric
 * substitution draws exactly one digit.
 */
import { MAX_NAME_GLYPHS } from '../layout/layout-plan';
import type { Variable } from './types';

/** Keys match the `var` token names, so a token maps straight to its variable. */
const PLAYER_NAME_KEY = 'player-name';
const NUMBER_KEY = 'number';

/** Glyphs the numeric substitution draws: one BCD digit, always. */
const NUMBER_GLYPHS = 1;

const kBuiltins: readonly Variable[] = [
  {
    key: PLAYER_NAME_KEY,
    kind: 'engine',
    label: 'Player name',
    value: null,
    locked: true,
    maxGlyphs: MAX_NAME_GLYPHS,
    note: 'Read from the save file at draw time; up to six glyphs.',
  },
  {
    key: NUMBER_KEY,
    kind: 'engine',
    label: 'Number',
    value: null,
    locked: true,
    maxGlyphs: NUMBER_GLYPHS,
    note: 'One digit of a live counter, chosen by the game.',
  },
];

/** A fresh copy per call, so a caller can never edit the shared definitions. */
const builtinVariables = (): Variable[] => kBuiltins.map((variable) => ({ ...variable }));

/**
 * Stand-ins a preview shows where the game would substitute. Neutral and
 * worst-case-width: the name sample is six glyphs wide, like the field it
 * stands for.
 */
const ENGINE_SAMPLES: Record<string, string> = {
  [PLAYER_NAME_KEY]: 'PLAYER',
  [NUMBER_KEY]: '0',
};

const isBuiltinKey = (key: string): boolean => key === PLAYER_NAME_KEY || key === NUMBER_KEY;

export { builtinVariables, ENGINE_SAMPLES, isBuiltinKey, NUMBER_KEY, PLAYER_NAME_KEY };
