/* @layer renderer-hud @kind component */
/**
 * One placed ELEMENT, drawn by the compound that owns that kind of art.
 *
 * There is exactly one scale here and it is `placed.scale * scale`: the engine
 * reports how many SNES pixels an element got per intrinsic pixel, the view
 * reports how many display pixels a SNES pixel is worth, and every compound
 * below wants the product. Nothing multiplies a second time and nothing keeps a
 * size of its own. A box that is 20 px because its document said so hands down
 * a scale of 1.25 over a 16 px glyph, which is the d-pad cross.
 *
 * DIMMING ARRIVES FROM TWO PLACES AND MEANS TWO THINGS. `placed.dimmed` is the
 * engine's answer to `dimWhenEmpty`, saying "no slot named by this node fires
 * anything", which is what dims the whole d-pad cross for its four directions.
 * `content.slots[n].dimmed` is the save's answer, saying "this slot is unassigned, or
 * holds something you do not own yet". A glyph that names a slot takes either,
 * because the button under an item the player has not found should read as
 * quiet exactly as an empty button does; that is the rule the chip drew before
 * the tree, kept.
 */
import { TILE } from '@shared/hud/engine';
import { HudBox } from '../../../../primitives/HudBox';
import { HudSprite } from '../../../../primitives/HudSprite';
import { HudGlyph } from '../../../../composites/HudGlyph';
import { HudButton } from '../../../HudButton';
import { HudShape } from '../../../HudShape';
import { HudText } from '../../../HudText';
import { DIMMED_GLYPH_OPACITY } from '../../HudNodeRenderer.constants';
import type { HudNodeArtProps } from './HudNodeArt.type';
import type { HudGlyphSpec, HudNodeContent } from '../../HudNodeRenderer.type';

interface PartProps {
  spec: HudGlyphSpec;
  content: HudNodeContent;
  dimmed: boolean;
  scale: number;
}

/** A control's picture: its own artwork, dimmed when the control is idle. */
const GlyphArt = (props: PartProps) => {
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

const HudNodeArt = (props: HudNodeArtProps) => {
  const { placed, scale, content, spritesBase, dataScope } = props;
  const { node } = placed;
  if (node.kind !== 'element') return null;

  const spec = node.element;
  const s = placed.scale * scale;
  const tile = TILE * s;
  const v = content.vitals;

  switch (spec.type) {
    case 'shape':
      return <HudShape spec={spec} scope={dataScope} heartMode={v.heartMode} scale={s} />;
    case 'glyph':
      return <GlyphArt spec={spec} content={content} dimmed={placed.dimmed} scale={s} />;
    case 'slot': {
      const held = content.slots[spec.index];
      if (!held || held.role === 'none' || !held.itemSprite) return null;
      const quiet = held.dimmed || placed.dimmed;
      return (
        <HudSprite
          src={`${spritesBase}${held.itemSprite}.png`}
          width={tile} height={tile}
          outline={!quiet} silhouette={quiet} scale={s}
        />
      );
    }
    case 'sprite':
      // A sprite's own box (`spec.box`, `intrinsic-size.ts`) may not be
      // square - the bomb/arrow counters are 16x8, the key counter 8x8 - so
      // this reads the engine's own already-contained rect instead of the
      // fixed `tile` every other 16x16 element kind still uses.
      return (
        <HudSprite
          src={`${spritesBase}${spec.file}.png`}
          width={placed.rect.w * scale} height={placed.rect.h * scale}
          outline scale={s}
        />
      );
    case 'spacer':
      return null;
    case 'text':
      return <HudText spec={spec} scope={dataScope} scale={s} spritesBase={spritesBase} />;
    case 'button':
      return <HudButton spec={spec} content={content} unassigned={placed.dimmed} scale={s} spritesBase={spritesBase} />;
    case 'repeat':
    case 'switch':
      // Unreachable: `layoutHud` expands the tree
      // (`shared/hud/engine/expand.ts`) before a node is ever placed, so no
      // `PlacedNode` this component sees can carry either dynamic kind.
      return null;
  }
};

export { HudNodeArt };
