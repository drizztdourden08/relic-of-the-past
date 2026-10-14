/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { PauseText } from '../../../composites/PauseText';
import { hintY } from '../behavior/hint-y';
import { HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH } from '../PauseGearScreen.constants';
import type { GearSideColumnsProps } from '../PauseGearScreen.type';

const GearSideColumns = ({ hintLines, hero, rowCount, scale, spritesBase }: GearSideColumnsProps) => {
  const px = (n: number): number => n * scale;

  return (
    <>
      <HudBox style={{
        position: 'absolute',
        left: px(HERO_X),
        top: px(HERO_Y),
        width: px(HERO_COLUMN_W),
        display: 'flex',
        justifyContent: 'center',
      }}>
        {hero}
      </HudBox>

      <HudBox style={{
        position: 'absolute',
        left: px(HERO_X),
        top: px(hintY(rowCount)),
        width: px(HERO_COLUMN_W),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {hintLines.map((line, index) => (
          <PauseText key={index} text={line} scale={scale} size={HINT_GLYPH} dim spritesBase={spritesBase} />
        ))}
      </HudBox>
    </>
  );
};

export { GearSideColumns };
