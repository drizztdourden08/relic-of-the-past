/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { PauseTextColumn } from '../../../composites/PauseTextColumn';
import { hintY } from '../behavior/hint-y';
import { HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH } from '../PauseGearScreen.constants';
import type { GearSideColumnsProps } from '../PauseGearScreen.type';

const GearSideColumns = ({ hintLines, hero, rowCount, scale, spritesBase }: GearSideColumnsProps) => (
  <>
    <HudBox style={{
      position: 'absolute',
      left: HERO_X * scale,
      top: HERO_Y * scale,
      width: HERO_COLUMN_W * scale,
      display: 'flex',
      justifyContent: 'center',
    }}>
      {hero}
    </HudBox>

    <PauseTextColumn
      lines={hintLines}
      left={HERO_X}
      top={hintY(rowCount)}
      width={HERO_COLUMN_W}
      scale={scale}
      size={HINT_GLYPH}
      dim
      spritesBase={spritesBase}
    />
  </>
);

export { GearSideColumns };
