/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { GLYPH_SIZE } from '../../../composites/PauseText';
import { PauseTextColumn } from '../../../composites/PauseTextColumn';
import { HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH, HINT_Y, NAME_Y } from '../PauseItemsScreen.constants';
import type { ItemsSideColumnsProps } from '../PauseItemsScreen.type';

const ItemsSideColumns = ({ nameLines, hintLines, hero, scale, spritesBase }: ItemsSideColumnsProps) => (
  <>
    <HudBox style={{
      position: 'absolute',
      left: HERO_X * scale,
      top: HERO_Y * scale,
      width: HERO_COLUMN_W * scale,
      height: (NAME_Y - HERO_Y) * scale,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {hero}
    </HudBox>

    <PauseTextColumn
      lines={nameLines}
      left={HERO_X}
      top={NAME_Y}
      width={HERO_COLUMN_W}
      height={HINT_Y - NAME_Y}
      scale={scale}
      size={GLYPH_SIZE}
      spritesBase={spritesBase}
    />

    <PauseTextColumn
      lines={hintLines}
      left={HERO_X}
      top={HINT_Y}
      width={HERO_COLUMN_W}
      height={HINT_GLYPH * hintLines.length}
      scale={scale}
      size={HINT_GLYPH}
      dim
      spritesBase={spritesBase}
    />
  </>
);

export { ItemsSideColumns };
