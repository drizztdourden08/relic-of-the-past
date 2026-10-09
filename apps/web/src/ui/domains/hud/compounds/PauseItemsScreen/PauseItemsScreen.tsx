/* @layer renderer-hud @kind component */
import type { CSSProperties } from 'react';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { HudBox } from '../../primitives/HudBox';
import { GLYPH_SIZE, PauseText } from '../../composites/PauseText';
import { PauseCellGrid } from './sub-components/PauseCellGrid';
import {
  BOTTLES_Y, BOTTLE_BOX_COLS, BOTTLE_BOX_ROWS, BOTTLE_COLUMNS,
  GRID_COLUMNS, HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH, HINT_Y,
  ITEMS_BOX_COLS, ITEMS_BOX_ROWS, NAME_Y,
} from './PauseItemsScreen.constants';
import type { PauseItemsScreenProps } from './PauseItemsScreen.type';

const PauseItemsScreen = (props: PauseItemsScreenProps) => {
  const {
    items, bottles, section, cursor, nameLines, hintLines, hero, scale, spritesBase, onFocusCell,
  } = props;

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
    <HudBox style={{ position: 'relative' }}>
      <PauseBorderBox
        color="green"
        cols={ITEMS_BOX_COLS}
        rows={ITEMS_BOX_ROWS}
        scale={scale}
        spritesBase={spritesBase}
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <PauseCellGrid
          cells={items}
          columns={GRID_COLUMNS}
          cursor={cursor}
          showCursor={section === 'items'}
          scale={scale}
          spritesBase={spritesBase}
          onPick={(index) => onFocusCell('items', index)}
        />
      </PauseBorderBox>

      <PauseBorderBox
        color="blue"
        cols={BOTTLE_BOX_COLS}
        rows={BOTTLE_BOX_ROWS}
        scale={scale}
        spritesBase={spritesBase}
        style={{ position: 'absolute', left: 0, top: px(BOTTLES_Y) }}
      >
        <PauseCellGrid
          cells={bottles}
          columns={BOTTLE_COLUMNS}
          cursor={cursor}
          showCursor={section === 'bottles'}
          scale={scale}
          spritesBase={spritesBase}
          onPick={(index) => onFocusCell('bottles', index)}
        />
      </PauseBorderBox>

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
    </HudBox>
  );
};

export { PauseItemsScreen };
