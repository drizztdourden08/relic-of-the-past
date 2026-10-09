/* @layer renderer-hud @kind component */
import { snapGameFontSize } from '@shared/hud/engine';
import { HudBox } from '../../../primitives/HudBox';
import { DEFAULT_GAME_STROKE, FONT_VARS } from '../HudText.constants';
import type { FontTextProps } from '../HudText.type';
import { flatColor } from '../behavior/flat-color';
import { strokeCss } from '../behavior/stroke-css';

const FontText = (props: FontTextProps) => {
  const { text, spec, face, scope, scale } = props;
  const size = (face.family === 'game' ? snapGameFontSize(face.size) : face.size) * scale;
  const stroke = spec.stroke ?? (face.family === 'game' ? DEFAULT_GAME_STROKE : undefined);
  const color = spec.color ? flatColor(spec.color) : (face.family === 'game' ? 'var(--game-ink)' : '#fff');
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
