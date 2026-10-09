/* @layer renderer-hud @kind component */
import { resolveTextContent, textIntrinsicSize } from '@shared/hud/engine';
import type { HudTextSpec } from '@shared/types/hud';
import { HudBox } from '../../primitives/HudBox';
import type { HudTextProps } from './HudText.type';
import { FontText } from './sub-components/FontText';
import { SpriteGlyphs } from './sub-components/SpriteGlyphs';

const justifyFor = (align: HudTextSpec['align']): string => (
  align === 'end' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start'
);

const HudText = (props: HudTextProps) => {
  const { spec, scope, scale, spritesBase } = props;
  const text = resolveTextContent(spec, scope);
  const natural = textIntrinsicSize(text, spec.face);

  return (
    <HudBox
      style={{
        display: 'flex', alignItems: 'center', justifyContent: justifyFor(spec.align),
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
