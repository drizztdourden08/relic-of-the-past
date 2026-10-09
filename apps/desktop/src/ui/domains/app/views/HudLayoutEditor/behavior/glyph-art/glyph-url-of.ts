/* @layer renderer-components @kind logic */
import { publicAsset } from '@app/lib/assets/public-asset';
import { customGlyphUrl } from '@app/lib/hud/custom-glyph-store';
import type { GlyphSource } from '@rotp/input-mapping';

const glyphUrlOf = (source: GlyphSource | null): string | undefined => {
  if (!source) return undefined;
  return source.kind === 'built-in' ? publicAsset(source.assetPath) : customGlyphUrl(source.fileKey) ?? undefined;
};

export { glyphUrlOf };
