/* @layer renderer-components @kind logic */
/**
 * The one rule that replaces the `123 | ƒx` switch: what a person TYPES, and
 * what the document KEEPS.
 *
 * THE LEADING `=` IS THE ONLY DISCRIMINATOR, AND IT IS NEVER STORED. Content
 * with no `=` that parses as a finite numeral is the number 24. Content with a
 * leading `=` is `{ from: 'data', expr }` ALWAYS. It stays one even when what follows is a
 * bare numeral, so `=24` and `24` are both legal, distinguishable, and both
 * round-trip. `compile-expr` never sees the `=`; every shipped layout loads
 * unchanged and reads back as `= ceil(life_max / 8)`.
 *
 * `==` ESCAPES ONE LITERAL `=`, as in a spreadsheet. It matters only on a
 * text field, where a leading `=` could be content; on a numeric field a
 * leading `=` has no other meaning, so the escape is inert there, not
 * special-cased away.
 *
 * THE STEPPER IS A PREDICATE, NOT A MODE. Arrow-key nudge, the spinner column
 * and the wheel are live exactly while the field's CURRENT TEXT parses as a
 * bare decimal numeral. That is evaluated on every keystroke, not remembered.
 * So `2` nudges, `= gap_base` does not, and the moment a `=` is deleted the
 * same field steps again with no state to reconcile.
 */
import type { Value } from '@shared/types/hud';

const FORMULA_PREFIX = '=';

/** Deliberately stricter than `Number()`: `''`, `' '`, `Infinity` and `0x10`
 *  must NOT read as numerals, or clearing a field would commit a number. */
const NUMERAL = /^-?(\d+\.?\d*|\.\d+)$/;

const isNumeral = (text: string): boolean => NUMERAL.test(text.trim());

/** What the spinner, the arrow keys and the wheel ask before they act. */
const stepsAsNumber = (text: string): boolean => isNumeral(text);

const isFormulaText = (text: string): boolean => text.trimStart().startsWith(FORMULA_PREFIX)
  && !text.trimStart().startsWith(`${FORMULA_PREFIX}${FORMULA_PREFIX}`);

/** The expression a formula text carries, with the marker and its padding
 *  removed. This is what the document stores and what the parser is given. */
const exprOf = (text: string): string => text.trimStart().slice(FORMULA_PREFIX.length).trim();

/**
 * The document's own `Value`, as the field shows it. A stored expression is
 * always displayed with its marker back on, which is why the marker can be
 * absent from the document without the round trip losing anything.
 *
 * `undefined` IS THE EMPTY FIELD, for the optional properties phase 6 added:
 * a min/max limit that is not set has no text, and typing one into an empty
 * field is how it comes into existence.
 */
const textOf = (value: Value | undefined): string => (
  value === undefined ? ''
    : typeof value === 'number' ? String(value) : `${FORMULA_PREFIX} ${value.expr}`
);

/**
 * The document value for what is in the field, or `null` when the text is
 * neither. An unparseable literal on a numeric field is an error the
 * caller reports, not a value it stores.
 */
const valueOf = (text: string): Value | null => {
  if (isFormulaText(text)) return { from: 'data', expr: exprOf(text) };
  return isNumeral(text) ? Number(text.trim()) : null;
};

/** Text-field content: `==x` is the literal `=x`, everything else is itself. */
const literalTextOf = (text: string): string => (
  text.trimStart().startsWith(`${FORMULA_PREFIX}${FORMULA_PREFIX}`) ? text.trimStart().slice(1) : text
);

/**
 * THE SAME RULE, ON A `text` ELEMENT'S `value`. That is the one property in the
 * document that is `Value | string` instead of `Value`, and the one place the
 * `==` escape above was written for and had no caller until phase 9.
 *
 * `TextContent` used to carry an OUTER `text | ƒx` `SegmentedControl` in front
 * of `ValueField`'s own inner one: two mode switches for one property, and the
 * outer one DISCARDED the expression on the way past (`{ from: 'data', expr }`
 * → `''`) where `ValueField` was careful to preserve it. There is no switch
 * now, so there is nothing to discard: a leading `=` is the only thing that
 * says "formula", and it is a thing a person types, not a mode the
 * field remembers.
 */
const textOfTextValue = (value: Value | string): string => {
  if (typeof value !== 'string') return textOf(value);
  // A stored string that really does begin with `=` is shown escaped, so what
  // is read back is what was stored, not a formula the author never
  // wrote. This is the whole reason the escape exists.
  return value.startsWith(FORMULA_PREFIX) ? `${FORMULA_PREFIX}${value}` : value;
};

/**
 * A `text` value never fails to parse: anything that is not a formula and not
 * a numeral is a string, which is what a text element is for. So this
 * returns a value in every case where `valueOf` can return `null`.
 *
 * A BARE NUMERAL STAYS A NUMBER, because `format.digits`/`format.pad` are
 * "meaningful only when `value` resolves to a number" (`hud-text.ts`). Typing
 * `24` into a counter and having it come back as an unformattable string would
 * silently disconnect the two fields sitting directly beneath it.
 */
const textValueOf = (text: string): Value | string => {
  if (isFormulaText(text)) return { from: 'data', expr: exprOf(text) };
  const literal = literalTextOf(text);
  return isNumeral(literal) ? Number(literal.trim()) : literal;
};

/**
 * Typing `=` in front of `24` is the mode switch's "preserve what you can",
 * made structural: the digits stay put and become the starting formula, and
 * deleting the `=` leaves whatever text was there for the field to read back
 * as a numeral if it can.
 */
const withFormulaMarker = (text: string): string => (
  isFormulaText(text) ? text : `${FORMULA_PREFIX} ${text.trim()}`
);

export {
  exprOf, FORMULA_PREFIX, isFormulaText, isNumeral, literalTextOf,
  stepsAsNumber, textOf, textOfTextValue, textValueOf, valueOf, withFormulaMarker,
};
