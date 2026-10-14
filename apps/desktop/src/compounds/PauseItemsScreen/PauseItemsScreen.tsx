/* @layer renderer-hud @kind component */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { HudBox } from '../../primitives/HudBox';
import { PauseCellGrid } from './sub-components/PauseCellGrid';
import { ItemsSideColumns } from './sub-components/ItemsSideColumns';
import {
  BOTTLES_Y, BOTTLE_BOX_COLS, BOTTLE_BOX_ROWS, BOTTLE_COLUMNS,
  GRID_COLUMNS, ITEMS_BOX_COLS, ITEMS_BOX_ROWS,
} from './PauseItemsScreen.constants';
import type { PauseItemsScreenProps } from './PauseItemsScreen.type';

const PauseItemsScreen = (props: PauseItemsScreenProps) => {
  const {
    items, bottles, section, cursor, nameLines, hintLines, hero, scale, spritesBase, onFocusCell,
  } = props;

  return (
    <HudBox layout="relative">
      <PauseBorderBox
        color="green"
        cols={ITEMS_BOX_COLS}
        rows={ITEMS_BOX_ROWS}
        scale={scale}
        spritesBase={spritesBase}
        atOrigin
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
        style={{ position: 'absolute', left: 0, top: scale * BOTTLES_Y }}
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

      <ItemsSideColumns nameLines={nameLines} hintLines={hintLines} hero={hero} scale={scale} spritesBase={spritesBase} />
    </HudBox>
  );
};

export { PauseItemsScreen };
