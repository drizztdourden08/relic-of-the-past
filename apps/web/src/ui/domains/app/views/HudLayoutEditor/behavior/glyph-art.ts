/* @layer renderer-components @kind logic */
/**
 * Which PICTURE a glyph position actually draws, resolved the same way the
 * live HUD resolves it: this pack → its declared fallback → generic.
 *
 * WHY IT MOVED OUT OF `GlyphPickerGrid`. The grid was the only thing that knew
 * how to turn `{ pack, position }` into a URL, so every field that referenced a
 * glyph printed the position's SDL name instead (`DPAD`, `generic · A`) and
 * left the artwork behind a click. `ReferenceField` needs the same answer at
 * rest, which is the whole of phase 9's first item. `SlotRefField` needs
 * it for the glyph a slot is bound to, so the resolution is a function three
 * callers share instead of a private helper one of them owns.
 */
import { publicAsset } from '@app/lib/assets/public-asset';
import { customGlyphUrl } from '@app/lib/hud/custom-glyph-store';
import { findGlyphPack, GENERIC_PACK_ID } from '@shared/input/glyphs';
import type { GlyphPack, GlyphSource, HudGlyphPosition } from '@shared/types/hud';

/** The whole-d-pad cross: one picture for every pack (see the renderer's own
 *  `HudNodeRenderer.constants` for why DPAD is not a real SDL position). */
const DPAD_ART: GlyphSource = { kind: 'built-in', assetPath: 'buttons/generic/generic_dpad.svg' };

/** `pack` null means "Auto", which is whatever generic draws. */
const glyphSourceFor = (
  pack: GlyphPack | null, generic: GlyphPack | null, position: HudGlyphPosition,
): GlyphSource | null => {
  if (position === 'DPAD') return DPAD_ART;
  if (!pack) return generic?.glyphs[position] ?? null;
  return pack.glyphs[position] ?? generic?.glyphs[position] ?? null;
};

const glyphUrlOf = (source: GlyphSource | null): string | undefined => {
  if (!source) return undefined;
  return source.kind === 'built-in' ? publicAsset(source.assetPath) : customGlyphUrl(source.fileKey) ?? undefined;
};

/**
 * The one-call form a field wants: a pack ID (or none, for Auto) and a
 * position in, a URL or `undefined` out. `undefined` is a real answer for a
 * position nothing anywhere draws, and `Thumbnail` renders its placeholder
 * for it instead of a broken image.
 */
const glyphArtUrl = (
  packs: readonly GlyphPack[], packId: string | undefined, position: string,
): string | undefined => {
  const generic = findGlyphPack(GENERIC_PACK_ID, packs);
  const pack = packId ? findGlyphPack(packId, packs) : null;
  return glyphUrlOf(glyphSourceFor(pack, generic, position as HudGlyphPosition));
};

export { DPAD_ART, glyphArtUrl, glyphSourceFor, glyphUrlOf };
