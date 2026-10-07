/* @layer shared-game @kind types */
/**
 * What a structural edit needs beyond the document itself: where the author is,
 * and which language the result has to be re-measured in.
 *
 * The caret is deliberately coarse. An edit here only ever cuts BETWEEN tokens.
 * A line is opened before or after one, never inside a substitution or a control
 * code, so a token offset says everything the edits need and the editor keeps
 * its own finer-grained selection to itself. The word-breaking pass is the one
 * step that cuts inside a text token, and it decides where on its own from the
 * row budget, not from the caret.
 */
import type { LayoutOptions } from '../layout/layout-plan';
import type { GlyphMetrics } from '../layout/types';
import type { GlossaryTerm } from '../types';

/** Where the author is, in the coordinates the line views already carry. */
type Caret = {
  /** 0-based line index across the WHOLE entry, which is a view's own `index`. */
  line: number;
  /** How many of that line's content tokens sit before the caret. */
  token: number;
};

/**
 * The language every derived number in an edit is taken against. `opts` is
 * passed straight through to the layout plan, so a preview measured with one
 * concrete player name keeps measuring with it after an edit.
 */
type StructureContext = {
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
  opts?: LayoutOptions;
};

export type { Caret, StructureContext };
