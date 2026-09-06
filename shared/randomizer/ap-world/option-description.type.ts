/* @layer shared-game @kind types */
/**
 * How an option explains itself. A setting with one thing to say says it in a
 * sentence. A setting whose behaviour splits — a mode per value, a rule per
 * currency — says it as a list instead: one line per point, each line opening
 * with the short term it is about and then plain text saying what happens.
 *
 * Both shapes are DATA. Nothing here knows about markup: a panel decides how
 * a line looks, and the flattened "term: detail" reading is what a caption,
 * a tooltip or a screen reader gets.
 */

/** One line of a listed description. */
interface OptionDetail {
  /** The short lead-in: a mode name, a value, the thing the line is about. */
  term: string;
  /** What that term does, in plain words. Never repeats the term. */
  detail: string;
}

/** One sentence, or a list of term/detail lines. */
type OptionDescription = string | readonly OptionDetail[];

export type { OptionDescription, OptionDetail };
