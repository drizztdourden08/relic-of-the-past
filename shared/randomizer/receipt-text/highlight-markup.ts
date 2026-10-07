/* @layer shared-game @kind logic */
/**
 * The markup a receipt line uses to colour its names: an item name in the
 * primary highlight, a player name in the secondary one. Each span is a
 * private-use character, the words, then the end character, so the markup can
 * never collide with a name the player typed. The dialogue composer turns the
 * three characters into the core's highlight bytes (session-dialogue); they
 * have no width, and any copy of a line meant for reading strips them.
 */

const HIGHLIGHT_PRIMARY = '\u{E000}';
const HIGHLIGHT_SECONDARY = '\u{E001}';
const HIGHLIGHT_END = '\u{E002}';

/** The span each marker opens, in the core's numbering: 0 closes, 1 primary, 2 secondary. */
const HIGHLIGHT_KIND: ReadonlyMap<string, number> = new Map([
  [HIGHLIGHT_END, 0], [HIGHLIGHT_PRIMARY, 1], [HIGHLIGHT_SECONDARY, 2],
]);

const MARKERS_RE = /[\u{E000}-\u{E002}]/gu;

/** An item name, in the primary highlight. */
const primary = (text: string): string => (text === '' ? text : `${HIGHLIGHT_PRIMARY}${text}${HIGHLIGHT_END}`);

/** A player name, in the secondary highlight. */
const secondary = (text: string): string => (text === '' ? text : `${HIGHLIGHT_SECONDARY}${text}${HIGHLIGHT_END}`);

const isHighlightMarker = (ch: string): boolean => HIGHLIGHT_KIND.has(ch);

/** The line as a reader sees it, with no markup. */
const stripHighlight = (text: string): string => text.replace(MARKERS_RE, '');

/** The first letter upper-cased, looking past any marker that opens the text. */
const capitalizeMarked = (text: string): string => {
  const at = [...text].findIndex((ch) => !isHighlightMarker(ch));
  if (at < 0) return text;
  const chars = [...text];
  chars[at] = chars[at].toUpperCase();
  return chars.join('');
};

/**
 * Each row closes the span it ends inside and the next row opens it again, so a
 * row read on its own (a choice line repeats its last row as the prompt) still
 * starts in the right colour.
 */
const balanceRows = (rows: readonly string[]): string[] => {
  let open = 0;
  return rows.map((row) => {
    const opening = open === 1 ? HIGHLIGHT_PRIMARY : open === 2 ? HIGHLIGHT_SECONDARY : '';
    for (const ch of row) open = HIGHLIGHT_KIND.get(ch) ?? open;
    return `${opening}${row}${open === 0 ? '' : HIGHLIGHT_END}`;
  });
};

export {
  HIGHLIGHT_END, HIGHLIGHT_KIND, HIGHLIGHT_PRIMARY, HIGHLIGHT_SECONDARY,
  balanceRows, capitalizeMarked, isHighlightMarker, primary, secondary, stripHighlight,
};
