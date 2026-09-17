/* @layer shared-game @kind logic */
/**
 * An alphabet entry that names a picture instead of spelling a character: an arrow, a button
 * face, a heart piece, the ellipsis run. The modern font has no face for these, so a row renderer
 * draws them from the glyph sheet.
 */
const isPictureGlyph = (entry: string): boolean => entry.length > 1 && entry.startsWith('[');

export { isPictureGlyph };
