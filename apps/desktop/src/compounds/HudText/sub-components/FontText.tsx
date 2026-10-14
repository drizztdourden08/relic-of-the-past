/* @layer renderer-hud @kind component */
import { snapGameFontSize } from '@rotp/hud';
import { HudBox } from '../../../primitives/HudBox';
import { DEFAULT_GAME_STROKE, FONT_VARS } from '../HudText.constants';
import type { FontTextProps } from '../HudText.type';
import { textColor } from '../behavior/text-color';
import { strokeCss } from '../behavior/stroke-css';

const FontText = (props: FontTextProps) => {
  const { text, spec, face, scope, scale } = props;
  const size = (face.family === 'game' ? snapGameFontSize(face.size) : face.size) * scale;
  const stroke = spec.stroke ?? (face.family === 'game' ? DEFAULT_GAME_STROKE : undefined);
  const color = textColor(spec, face.family === 'game');
  return (
    <HudBox
      as="span"
      style={{
        fontFamily: FONT_VARS[face.family],
        fontSize: size,
        fontWeight: face.weight,
        color,
        letterSpacing: spec.tracking !== undefined ? spec.tracking * scale : undefined,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...(stroke ? strokeCss(stroke, scope, scale) : {}),
      }}
    >
      {text}
    </HudBox>
  );
};

export { FontText };
