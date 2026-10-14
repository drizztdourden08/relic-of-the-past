/* @layer renderer-hud @kind component */
import type { CSSProperties } from 'react';
import { HudBox } from '../../../primitives/HudBox';
import { GLYPH_SIZE, PauseText } from '../../../composites/PauseText';
import { HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH, HINT_Y, NAME_Y } from '../PauseItemsScreen.constants';
import type { ItemsSideColumnsProps } from '../PauseItemsScreen.type';

const ItemsSideColumns = ({ nameLines, hintLines, hero, scale, spritesBase }: ItemsSideColumnsProps) => {
  const px = (n: number): number => n * scale;

  const centred = (top: number, height: number): CSSProperties => ({
    position: 'absolute',
    left: px(HERO_X),
    top: px(top),
    width: px(HERO_COLUMN_W),
    height: px(height),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  });

  return (
    <>
      <HudBox style={centred(HERO_Y, NAME_Y - HERO_Y)}>{hero}</HudBox>

      <HudBox style={centred(NAME_Y, HINT_Y - NAME_Y)}>
        {nameLines.map((line, index) => (
          <PauseText key={index} text={line} scale={scale} size={GLYPH_SIZE} spritesBase={spritesBase} />
        ))}
      </HudBox>

      <HudBox style={centred(HINT_Y, HINT_GLYPH * hintLines.length)}>
        {hintLines.map((line, index) => (
          <PauseText key={index} text={line} scale={scale} size={HINT_GLYPH} dim spritesBase={spritesBase} />
        ))}
      </HudBox>
    </>
  );
};

export { ItemsSideColumns };
