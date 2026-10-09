/* @layer renderer-lib @kind logic */
import { glyphUrlCache } from './glyph-url-cache';

const customGlyphUrl = (fileKey: string): string | null => glyphUrlCache.get(fileKey);

export { customGlyphUrl };
