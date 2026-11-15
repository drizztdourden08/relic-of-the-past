/* @layer shared-asset-extraction @kind logic */
const glyphPlaceholder = (index: number): string =>
  `[Glyph${index.toString(16).toUpperCase().padStart(2, '0')}]`;

export { glyphPlaceholder };
