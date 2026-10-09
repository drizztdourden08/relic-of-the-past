/* @layer shared-input @kind logic */
import { GLYPH_ASSET_PATHS } from './glyph-asset-paths.constants';

const glyphAssetPath = (iconKey: string): string | null => GLYPH_ASSET_PATHS[iconKey] ?? null;

export { glyphAssetPath };
