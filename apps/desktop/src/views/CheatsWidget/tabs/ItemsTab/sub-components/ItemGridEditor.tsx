/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseButtonLabel, PauseItemSlot, PauseLabel } from '@app/hud';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { BOTTLE_SLOT_INDEX, EMPTY_BOTTLE, ITEM_GRID, ITEM_SLOT_COUNT } from '../ItemsTab.constants';
import { givableTier } from '../behavior/givable-tier';
import { useSlotClick } from '../behavior/useSlotClick';
import { SlotCell } from './SlotCell';
import type { ItemGridEditorProps, SlotSpec } from '../ItemsTab.type';

const ghostSpriteOf = (spec: SlotSpec): string | null =>
  (spec.kind === 'bottle' ? getSlotSprite(BOTTLE_SLOT_INDEX, EMPTY_BOTTLE) : (givableTier(spec)?.sprite ?? null));

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
    const owned = value > 0;
    const shown = slot === BOTTLE_SLOT_INDEX ? (bottles[value - 1] ?? 0) : value;
    const tierMark = spec.kind !== 'flag' && spec.kind !== 'bottle' && value > 1;
    const ghost = ghostSpriteOf(spec);
    return (
      <SlotCell
        key={flashKey(slot)}
        size={tile * 2}
        owned={owned}
        menu={owned}
        ghost={ghost ? `${spritesBase}${ghost}.png` : null}
        title={spec.tiers.find((tier) => tier.value === value)?.label ?? givableTier(spec)?.label ?? spec.nameKey}
        flash={isFlashing(slot)}
        onClick={(e) => click(spec, owned, e)}
        onOpenList={(e) => onOpen({ spec, anchor: e.currentTarget })}
        onHover={(active) => onHover(active ? slot : null)}
      >
        <PauseItemSlot
          saveSlotIndex={slot}
          itemValue={shown}
          selected={hovered === slot}
          animate={false}
          scale={scale}
          spritesBase={spritesBase}
        />
        {tierMark && <Text className="cheats-items__tier">{value}</Text>}
      </SlotCell>
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
