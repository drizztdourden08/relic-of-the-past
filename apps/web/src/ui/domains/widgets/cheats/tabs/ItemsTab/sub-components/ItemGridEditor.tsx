/* @layer renderer-widgets @kind component */
/**
 * The pause menu's ITEM box with every slot clickable: the same green border, Y label and
 * 5x4 grid of 2x2-tile cells the game draws. An owned cell shows the game's slot with the
 * cursor ring following the pointer; an unowned one shows a ghost of its first tier, and a
 * click gives it. A tiered slot above its first tier wears a small tier mark.
 */
import { Box, Text } from '@ds/primitives';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseButtonLabel, PauseItemSlot, PauseLabel } from '@domains/hud';
import { getSlotSprite } from '@domains/hud/composites/PauseItemSlot';
import { BOTTLE_SLOT_INDEX, ITEM_GRID } from '../ItemsTab.constants';
import { givableTier, useSlotClick } from '../behavior/useSlotClick';
import { SlotCell } from './SlotCell';
import type { OpenSlot, SlotSpec, SlotWrite } from '../ItemsTab.type';

type ItemGridEditorProps = {
  specs: Map<number, SlotSpec>;
  hovered: number | null;
  scale: number;
  spritesBase: string;
  onHover: (slot: number | null) => void;
  onOpen: (open: OpenSlot) => void;
  write: (write: SlotWrite) => void;
};

/** An unowned bottle slot ghosts an empty bottle. */
const EMPTY_BOTTLE = 2;

const SLOT_COUNT = ITEM_GRID.gridCols * ITEM_GRID.gridRows;

const ghostSpriteOf = (spec: SlotSpec): string | null =>
  (spec.kind === 'bottle' ? getSlotSprite(BOTTLE_SLOT_INDEX, EMPTY_BOTTLE) : (givableTier(spec)?.sprite ?? null));

const ItemGridEditor = (props: ItemGridEditorProps) => {
  const { specs, hovered, scale, spritesBase, onHover, onOpen, write } = props;
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const { click, flashKey, isFlashing } = useSlotClick({ onOpen, write });
  const tile = 8 * scale;

  const cells = Array.from({ length: SLOT_COUNT }, (_, slot) => {
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
export type { ItemGridEditorProps };
