/* @layer renderer-hud @kind component */
import { resolveTextContent, textIntrinsicSize } from '@rotp/hud';
import { HudBox } from '../../primitives/HudBox';
import { JUSTIFY_BY_ALIGN } from './HudText.constants';
import type { HudTextProps } from './HudText.type';
import { FontText } from './sub-components/FontText';
import { SpriteGlyphs } from './sub-components/SpriteGlyphs';

const HudText = (props: HudTextProps) => {
  const { spec, scope, scale, spritesBase } = props;
  const text = resolveTextContent(spec, scope);
  const natural = textIntrinsicSize(text, spec.face);

  return (
    <HudBox
      style={{
        display: 'flex', alignItems: 'center', justifyContent: JUSTIFY_BY_ALIGN[spec.align ?? 'start'],
        width: natural.w * scale, height: natural.h * scale,
      }}
    >
      {spec.face.from === 'sprite'
        ? <SpriteGlyphs text={text} face={spec.face} scale={scale} spritesBase={spritesBase} />
        : <FontText text={text} spec={spec} face={spec.face} scope={scope} scale={scale} />}
    </HudBox>
  );
};

export { HudText };
