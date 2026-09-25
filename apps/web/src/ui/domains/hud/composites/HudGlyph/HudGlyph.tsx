/* @layer renderer-hud @kind component */
/**
 * HudGlyph draws one controller glyph at tile scale.
 *
 * The glyph layer is shared with the Node side, so it stores root-relative
 * asset paths and deliberately never runs them through the renderer's
 * public-asset helper (it has no `import.meta.env` to ask). Applying that
 * prefix is therefore this component's job, and the reason the whole glyph
 * pipeline can stay in `shared/`.
 *
 * Glyphs are vector artwork, not extracted sprites, so nothing here asks for
 * pixelated rendering: at a fractional scale a nearest-neighbour glyph would
 * look broken next to the pixel-art it sits on.
 *
 * A custom pack's source is a file key into the player's own glyph library,
 * which the glyph store has already turned into an object URL. That URL is used
 * RAW: `publicAsset` prefixes a root-relative path with the app's base, which
 * would mangle a `blob:` URL into a request for a file that does not exist. A
 * key the store has not primed yet renders nothing and leaves the space. The
 * cluster's geometry is fixed either way, so a missing glyph costs a hole,
 * never a reflow.
 */
import { publicAsset } from '@app/lib/assets/public-asset';
import { customGlyphUrl } from '@app/lib/hud/custom-glyph-store';
import { HudImage } from '../../primitives/HudImage';
import type { GlyphSource } from '@shared/types/hud';

/** A glyph occupies one 16x16 SNES-pixel tile pair, the same as an item sprite. */
const GLYPH_SIZE = 16;

interface HudGlyphProps {
  source: GlyphSource;
  scale: number;
  /** Edge length in SNES pixels (default 16). */
  size?: number;
}

const HudGlyph = (props: HudGlyphProps) => {
  const { source, scale, size = GLYPH_SIZE } = props;

  const src = source.kind === 'built-in' ? publicAsset(source.assetPath) : customGlyphUrl(source.fileKey);
  if (!src) return null;

  const px = size * scale;

  return (
    <HudImage
      src={src}
      width={px}
      height={px}
      style={{ display: 'block', width: px, height: px }}
    />
  );
};

export { HudGlyph, GLYPH_SIZE };
export type { HudGlyphProps };
