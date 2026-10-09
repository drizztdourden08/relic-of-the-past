/* @layer shared-game @kind constants */
const HIGHLIGHT_PRIMARY = '\u{E000}';
const HIGHLIGHT_SECONDARY = '\u{E001}';
const HIGHLIGHT_END = '\u{E002}';

const HIGHLIGHT_KIND: ReadonlyMap<string, number> = new Map([
  [HIGHLIGHT_END, 0], [HIGHLIGHT_PRIMARY, 1], [HIGHLIGHT_SECONDARY, 2],
]);

const MARKERS_RE = /[\u{E000}-\u{E002}]/gu;

export { HIGHLIGHT_END, HIGHLIGHT_KIND, HIGHLIGHT_PRIMARY, HIGHLIGHT_SECONDARY, MARKERS_RE };
