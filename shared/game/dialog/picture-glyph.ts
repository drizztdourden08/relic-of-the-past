/* @layer shared-game @kind logic */
const isPictureGlyph = (entry: string): boolean => entry.length > 1 && entry.startsWith('[');

export { isPictureGlyph };
