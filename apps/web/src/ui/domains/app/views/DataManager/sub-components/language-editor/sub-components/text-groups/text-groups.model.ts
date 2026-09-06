/* @layer renderer-components @kind logic */
/**
 * The pure reading of a group of fixed text slots: which of them a translator
 * has actually written, which ones a search keeps, and how a typed value
 * measures against the room the surface gives it.
 *
 * TRANSLATED means the translator wrote something of their own. An override
 * that is missing, blank, or still the exact original leaves the surface drawing
 * the original, so all three read as untranslated. A blank field showing the
 * original as its placeholder would otherwise be counted as work done.
 *
 * The fit is a plain count against a stated budget, not a rendered measurement:
 * these surfaces are drawn on a fixed grid where one drawn character takes one
 * cell, so the number of characters IS the number of cells used.
 *
 * Pure: slots and overrides in, numbers and verdicts out. Shared by the rail and
 * the rows so the two can never disagree about what is done.
 */
import type { ProgressVariant } from '@ds/primitives';
import type { TextGroup, TextLimit, TextSlot } from '@shared/game/language';

/**
 * Rows drawn at once. One group runs to the high hundreds and every row holds a
 * live field, so the whole list is far more DOM than a translator can read; the
 * search is what reaches past this.
 */
const ROW_CAP = 200;

/** Everything the caps-only surface can draw. Case is irrelevant, since it upper-cases. */
const CAPS_ALPHABET = /^[a-z0-9 &]*$/i;

/** How a typed value stands against the room it has. */
type SlotFit = {
  used: number;
  max: number;
  /** 'green' below the budget, gold once it is full, danger past it. */
  variant: ProgressVariant;
  /** The compact readout the row prints, e.g. '12/14' or '12/8 x2'. */
  readout: string;
  /** The same fact spelled out, for the row's tooltip. */
  detail: string;
};

/** What the search box and the toggle together keep. */
type SlotFilter = {
  query: string;
  untranslatedOnly: boolean;
};

/** How much of a group is written, and whether we were given the words to know. */
type GroupTally = {
  translated: number;
  total: number;
  /**
   * False when the caller handed over another group's overrides only. The tally
   * would then read as "none written" for a group that may well be finished, so
   * the rail states the size of that group instead of a number it cannot stand
   * behind. A caller passing every override gets a live tally on every group.
   */
  known: boolean;
};

const isTranslated = (slot: TextSlot, values: Record<string, string>): boolean => {
  const own = values[slot.key];
  return own !== undefined && own.trim().length > 0 && own !== slot.fallback;
};

const tallyOf = (
  group: TextGroup,
  values: Record<string, string>,
  active: boolean,
): GroupTally => ({
  translated: group.slots.reduce((done, slot) => (isTranslated(slot, values) ? done + 1 : done), 0),
  total: group.slots.length,
  known: active || group.slots.some((slot) => values[slot.key] !== undefined),
});

const variantFor = (used: number, max: number): ProgressVariant => {
  if (used > max) return 'danger';
  if (used >= max) return 'gold';
  return 'green';
};

/** Null for a slot with no stated budget, since there is nothing to meter. */
const fitOf = (limit: TextLimit, value: string): SlotFit | null => {
  if (limit.kind === 'none') return null;

  const used = [...value].length;
  const unit = limit.kind === 'glyphs' ? 'characters' : 'tiles';
  const rows = limit.kind === 'glyphs' && limit.lines ? ` over ${limit.lines} lines` : '';

  const lines = limit.kind === 'glyphs' && limit.lines ? ` x${limit.lines}` : '';

  return {
    used,
    max: limit.max,
    variant: variantFor(used, limit.max),
    readout: `${used}/${limit.max}${lines}`,
    detail: `${used} of ${limit.max} ${unit}${rows}`,
  };
};

/** True when the surface would have to drop part of what was typed. */
const offAlphabet = (slot: TextSlot, value: string): boolean =>
  slot.alphabet === 'latin-caps' && value.length > 0 && !CAPS_ALPHABET.test(value);

const matchesQuery = (slot: TextSlot, needle: string): boolean =>
  slot.label.toLowerCase().includes(needle)
  || slot.key.toLowerCase().includes(needle)
  || slot.fallback.toLowerCase().includes(needle);

const selectSlots = (
  group: TextGroup,
  values: Record<string, string>,
  filter: SlotFilter,
): TextSlot[] => {
  const needle = filter.query.trim().toLowerCase();

  return group.slots.filter((slot) => {
    if (needle.length > 0 && !matchesQuery(slot, needle)) return false;
    return !filter.untranslatedOnly || !isTranslated(slot, values);
  });
};

export { fitOf, isTranslated, offAlphabet, selectSlots, tallyOf, ROW_CAP };
export type { GroupTally, SlotFilter, SlotFit };
