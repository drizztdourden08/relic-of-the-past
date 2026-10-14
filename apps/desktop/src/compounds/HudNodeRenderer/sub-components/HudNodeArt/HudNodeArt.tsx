/* @layer renderer-hud @kind component */
import { TILE } from '@rotp/hud';
import { HudButton } from '../../../HudButton';
import { HudShape } from '../../../HudShape';
import { HudText } from '../../../HudText';
import { HudNodeCountdown } from '../HudNodeCountdown';
import type { HudNodeArtProps } from './HudNodeArt.type';
import { GlyphArt } from './sub-components/GlyphArt';
import { SlotArt } from './sub-components/SlotArt';
import { SpriteArt } from './sub-components/SpriteArt';

const HudNodeArt = (props: HudNodeArtProps) => {
  const { placed, scale, content, spritesBase, dataScope } = props;
  const { node } = placed;
  if (node.kind !== 'element') return null;

  const spec = node.element;
  const s = placed.scale * scale;

  if (spec.type === 'shape') return <HudShape spec={spec} scope={dataScope} heartMode={content.vitals.heartMode} scale={s} />;
  if (spec.type === 'glyph') return <GlyphArt spec={spec} content={content} dimmed={placed.dimmed} scale={s} />;
  if (spec.type === 'slot') {
    return <SlotArt spec={spec} content={content} dimmed={placed.dimmed} tile={TILE * s} scale={s} spritesBase={spritesBase} />;
  }
  if (spec.type === 'sprite') {
    return <SpriteArt spec={spec} rect={placed.rect} displayScale={scale} scale={s} spritesBase={spritesBase} />;
  }
  if (spec.type === 'text') return <HudText spec={spec} scope={dataScope} scale={s} spritesBase={spritesBase} />;
  if (spec.type === 'button') {
    return <HudButton spec={spec} content={content} unassigned={placed.dimmed} scale={s} spritesBase={spritesBase} />;
  }
  if (spec.type === 'countdown') {
    return <HudNodeCountdown spec={spec} countdown={content.countdown} scale={s} spritesBase={spritesBase} />;
  }
  return null;
};

export { HudNodeArt };
