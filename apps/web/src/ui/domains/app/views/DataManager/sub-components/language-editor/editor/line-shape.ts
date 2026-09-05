/* @layer renderer-components @kind logic */
/**
 * One line as the DOCUMENT stores it, and the two derivations the editor needs
 * from it. Measurement is never stored. It is recomputed from the shared layout
 * walk every time, so the gutter can never show a stale width.
 *
 * Why a paragraph is numbered here instead of by re-splitting the token stream:
 * a paragraph EXISTS in the document even when it contributes no tokens at all
 * (an empty line that carries no code of its own, such as the first line of a
 * new entry), and the model's splitter rightly reports nothing for it, because
 * there is nothing to write. A gutter that lost that row would stop lining up with the
 * text beside it, so numbering follows the paragraphs and only the numbers are
 * derived here. The rule itself is the model's: a row marker parks the pen on
 * its own row, a scroll parks it on the bottom row, and a line with no code sits
 * on the first row of its box.
 */
import { advanceForNewLine, lineMetrics, ROWS_PER_BOX } from '@shared/game/language';
import type {
  DialogueLineView, GlossaryTerm, GlyphMetrics, LineAdvance, Token,
} from '@shared/game/language';

/** A line stripped to what the document holds: structure plus content. */
type LineShape = {
  advance: LineAdvance;
  /** Content only, with no advance code and no trailing wait. */
  tokens: Token[];
  endsBox: boolean;
};

/** Where the pen ends up once this line's advance has been applied. */
const rowOfAdvance = (advance: LineAdvance): number => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : ROWS_PER_BOX;
};

/**
 * A glossary that can answer every reference the tokens make.
 *
 * Resolving a reference to a key the set does not carry THROWS, and mid-edit
 * that is an ordinary state to be in: a term can be renamed or removed while an
 * entry still points at it. An editor that threw there would go blank on a
 * keystroke, so an unknown key measures as its own name. That is wrong by
 * exactly the width of a placeholder, and is reported as a real issue elsewhere
 * by the entry validator.
 */
const measurableGlossary = (tokens: Token[], glossary: GlossaryTerm[]): GlossaryTerm[] => {
  const known = new Set(glossary.map((term) => term.key));
  const missing = new Set<string>();
  for (const token of tokens) {
    if (token.t === 'ref' && !known.has(token.key)) missing.add(token.key);
  }
  if (missing.size === 0) return glossary;
  return [...glossary, ...[...missing].map((key) => ({ key, value: key }))];
};

/** One line, numbered and measured, which is what a gutter row reads. */
const viewOfShape = (
  shape: LineShape,
  index: number,
  box: number,
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView => ({
  index,
  box,
  row: rowOfAdvance(shape.advance),
  advance: shape.advance,
  tokens: shape.tokens,
  endsBox: shape.endsBox,
  ...lineMetrics(shape.tokens, metrics, measurableGlossary(shape.tokens, glossary)),
});

/**
 * The advance for a line created directly after `shape`. This is the ONE place a
 * code is invented, and only ever for a line an author just asked for.
 *
 * `advanceForNewLine` reads a previous line's row and whether it ends the box,
 * so the view handed to it is structure with its measurements zeroed: they are
 * not read, and measuring here would mean carrying a font this far down for
 * nothing.
 */
const advanceAfterLine = (shape: LineShape): LineAdvance => advanceForNewLine({
  index: 0,
  box: 0,
  row: rowOfAdvance(shape.advance),
  advance: shape.advance,
  tokens: shape.tokens,
  endsBox: shape.endsBox,
  widthPx: 0,
  count: 0,
  overflow: false,
  freePx: 0,
});

export { advanceAfterLine, measurableGlossary, rowOfAdvance, viewOfShape };
export type { LineShape };
