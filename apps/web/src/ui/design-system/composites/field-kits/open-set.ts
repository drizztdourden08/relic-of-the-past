/* @layer renderer-components @kind logic */
/**
 * What a derived option list is good for.
 *
 * Kind inference reads a closed set off the values it can see, so `options` is
 * a record of what has been WRITTEN, never a statement of what is allowed. A
 * value the list has never seen is therefore still a legal value, and the moment
 * one is entered the control has to show it, or the record reads as
 * though the field were empty.
 */

/** The set a control offers: what was observed, plus whatever this record holds. */
const withCurrentValue = (
  options: readonly string[],
  current: string,
): readonly string[] =>
  current === '' || options.includes(current) ? options : [...options, current];

/**
 * What an entry commits to, or nothing at all. Blank and unchanged both mean
 * no edit. The entry closes either way, so neither needs reporting as one.
 * Clearing a field is the picker's job and stays gated on `optional` there;
 * this hatch only ever writes a value.
 */
const committedValue = (draft: string, current: string): string | undefined => {
  const next = draft.trim();
  return next === '' || next === current ? undefined : next;
};

export { committedValue, withCurrentValue };
