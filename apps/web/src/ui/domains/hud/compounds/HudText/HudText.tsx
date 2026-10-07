/* @layer renderer-hud @kind component */
/**
 * HudText draws a `text` element's own ink: the game's extracted glyph sprites,
 * or a real font. Content and sizing are resolved once, upstream, by
 * `resolve-text.ts` - this component only ever draws the string it is handed.
 *
 * THE DEFAULT STROKE IS `.game-text`, GENERALISED. That rule (white fill, blue
 * edge, `paint-order`, a four-way shadow ring filling a blocky face's diagonal
 * gaps) becomes this component's default the moment a `font: 'game'` face
 * carries no `stroke` of its own - not a special case, the same technique
 * with the author's own width and colour in place of the hardcoded ones.
 */
import { resolveValue } from '@shared/hud/data';
import {
  columnsForSpriteChar, resolveTextContent, snapGameFontSize, stemForSpriteChar, textIntrinsicSize,
} from '@shared/hud/engine';
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import type { HudFontFamily, HudTextFace, HudTextSpec, HudTextStroke, Paint } from '@shared/types/hud';

interface HudTextProps {
  spec: HudTextSpec;
  scope: Readonly<Record<string, number>>;
  scale: number;
  spritesBase: string;
}

const FONT_VARS: Record<HudFontFamily, string> = {
  game: 'var(--font-game)', sans: 'var(--font-sans)', mono: 'var(--font-mono)',
};

const flatColor = (paint: Paint): string => (typeof paint === 'string' ? paint : '#000');
const justifyFor = (align: HudTextSpec['align']): string => (
  align === 'end' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start'
);

const DEFAULT_GAME_STROKE: HudTextStroke = { width: 1, color: 'var(--game-stroke)' };

/** `.game-text`'s own stroke recipe, parameterised by width and colour rather
 *  than hardcoded to one pixel of one blue. */
const strokeCss = (stroke: HudTextStroke, scope: Readonly<Record<string, number>>, scale: number) => {
  const w = resolveValue(stroke.width, scope) * scale;
  const color = flatColor(stroke.color);
  return {
    WebkitTextStroke: `${w}px ${color}`,
    paintOrder: 'stroke fill' as const,
    textShadow: `${w}px 0 0 ${color}, -${w}px 0 0 ${color}, 0 ${w}px 0 ${color}, 0 -${w}px 0 ${color}`,
  };
};

const SpriteGlyphs = (props: { text: string; face: Extract<HudTextFace, { from: 'sprite' }>; scale: number; spritesBase: string }) => {
  const { text, face, scale, spritesBase } = props;
  const tile = 8 * scale;
  return (
    <HudBox style={{ display: 'flex', height: tile }}>
      {text.split('').map((char, i) => {
        const stem = stemForSpriteChar(face.set, char);
        const width = tile * columnsForSpriteChar(char);
        if (!stem) return <HudBox key={i} style={{ width, height: tile }} />;
        return (
          <HudImage
            key={i}
            src={`${spritesBase}${stem}.png`}
            width={width}
            height={tile}
            style={{ imageRendering: 'pixelated' }}
          />
        );
      })}
    </HudBox>
  );
};

const FontText = (
  props: {
    text: string; spec: HudTextSpec; face: Extract<HudTextFace, { from: 'font' }>;
    scope: Readonly<Record<string, number>>; scale: number;
  },
) => {
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
export type { HudTextProps };
