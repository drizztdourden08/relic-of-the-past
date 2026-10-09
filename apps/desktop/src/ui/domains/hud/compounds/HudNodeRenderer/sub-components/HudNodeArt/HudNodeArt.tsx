/* @layer renderer-hud @kind component */
import { TILE } from '@rotp/hud';
import { HudSprite } from '../../../../primitives/HudSprite';
import { HudButton } from '../../../HudButton';
import { HudShape } from '../../../HudShape';
import { HudText } from '../../../HudText';
import { HudNodeCountdown } from '../HudNodeCountdown';
import type { HudNodeArtProps } from './HudNodeArt.type';
import { GlyphArt } from './sub-components/GlyphArt';

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
    case 'countdown':
      return <HudNodeCountdown spec={spec} countdown={content.countdown} scale={s} spritesBase={spritesBase} />;
    case 'repeat':
    case 'switch':
      return null;
  }
};

export { HudNodeArt };
