/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseButtonLabel, PauseLabel } from '@app/hud';
import { ITEM_GRID, ITEM_SLOT_COUNT } from '../ItemsTab.constants';
import { shownValueOf } from '../behavior/shown-value-of';
import { useSlotClick } from '../behavior/useSlotClick';
import { ItemGridCell } from './ItemGridCell';
import type { ItemGridEditorProps } from '../ItemsTab.type';

const ItemGridEditor = (props: ItemGridEditorProps) => {
  const { specs, hovered, scale, spritesBase, onHover, onOpen, write } = props;
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const { click, flashKey, isFlashing } = useSlotClick({ onOpen, write });
  const tile = 8 * scale;

  const cells = Array.from({ length: ITEM_SLOT_COUNT }, (_, slot) => {
    const spec = specs.get(slot);
    if (!spec) return null;
    const value = items[slot] ?? 0;
    return (
      <ItemGridCell
        key={flashKey(slot)}
        slot={slot}
        spec={spec}
        value={value}
        shown={shownValueOf(slot, value, bottles)}
        selected={hovered === slot}
        flash={isFlashing(slot)}
        scale={scale}
        spritesBase={spritesBase}
        onClick={click}
        onOpen={onOpen}
        onHover={onHover}
      />
    );
  });

  return (
    <Box className="cheats-items__panel">
      <PauseBorderBox color="green" cols={ITEM_GRID.cols} rows={ITEM_GRID.rows} scale={scale} spritesBase={spritesBase}>
        <Box className="cheats-items__corner">
          <PauseButtonLabel button="y" scale={scale} spritesBase={spritesBase} />
        </Box>
        <Box
          className="cheats-items__grid"
          style={{
            gridTemplateColumns: `repeat(${ITEM_GRID.gridCols}, ${tile * 2}px)`,
            gridTemplateRows: `repeat(${ITEM_GRID.gridRows}, ${tile * 2}px)`,
            gap: tile,
            top: tile * ITEM_GRID.top,
            left: tile * ITEM_GRID.left,
          }}
        >
          {cells}
        </Box>
      </PauseBorderBox>
      <Box className="cheats-items__label" style={{ left: tile * ITEM_GRID.left }}>
        <PauseLabel name="item" tiles={2} scale={scale} spritesBase={spritesBase} />
      </Box>
    </Box>
  );
};

export { ItemGridEditor };
