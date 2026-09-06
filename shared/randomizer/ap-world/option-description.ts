/* @layer shared-game @kind logic */
/**
 * Reading a description in either shape. The listed form is what a panel
 * renders line by line; the flattened form is the single string every plain
 * consumer needs: a caption, a tooltip, a stored value, a screen reader
 * following the rows. Both come off the same entry, so the wording is
 * written once and can never drift into two versions of itself.
 */
import type { OptionDescription, OptionDetail } from './option-description.type';

/** The lines of a listed description; undefined for a plain one. */
const detailsOf = (description: OptionDescription): readonly OptionDetail[] | undefined =>
  (typeof description === 'string' ? undefined : description);

/**
 * The whole description as one string, "term: detail" per line. Every detail
 * is written as a finished sentence, so the joined reading is a paragraph
 * instead of a run-on.
 */
const plainTextOf = (description: OptionDescription): string =>
  (typeof description === 'string'
    ? description
    : description.map(({ term, detail }) => `${term}: ${detail}`).join(' '));

export { detailsOf, plainTextOf };
