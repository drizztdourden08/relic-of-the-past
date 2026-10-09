/* @layer renderer-hud @kind component */
import { TILE } from '@shared/hud/engine';
import { HudBox } from '../../../../../primitives/HudBox';
import { HudGlyph } from '../../../../../composites/HudGlyph';
import { DIMMED_GLYPH_OPACITY } from '../../../HudNodeRenderer.constants';
import type { GlyphArtProps } from '../HudNodeArt.type';

const GlyphArt = (props: GlyphArtProps) => {
  const { spec, content, dimmed, scale } = props;
  const source = content.glyph(spec);
  if (!source) return null;
  const held = spec.slot === undefined ? undefined : content.slots[spec.slot];
  const quiet = dimmed || (held?.dimmed ?? false);

  return (
    <HudBox style={{ opacity: quiet ? DIMMED_GLYPH_OPACITY : 1 }}>
      <HudGlyph source={source} scale={scale} size={TILE} />
    </HudBox>
  );
};

export { GlyphArt };
