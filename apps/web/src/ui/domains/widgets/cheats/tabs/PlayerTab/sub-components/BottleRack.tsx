/* @layer renderer-widgets @kind component */
/**
 * The four bottles in a yellow pause frame, each a click away from its contents list. A slot
 * with no bottle draws a dotted ghost with the empty bottle faded inside it. The list a bottle
 * opens carries every content with its sprite, the current one marked, and an "x4" on every
 * row that writes that content to all four slots.
 */
import { useCallback, useState } from 'react';
import { Box, Button, Image } from '@ds/primitives';
import { PauseBorderBox } from '@domains/hud';
import { getSlotSprite } from '@domains/hud/composites/PauseItemSlot';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { BottleContents, cheatSetBottle } from '@app/lib/game';
import type { BottleContentsValue } from '@app/lib/game';
import { ChoicePopover } from '../../../sub-components/ChoicePopover';
import type { ChoiceOption } from '../../../sub-components/ChoicePopover.type';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { IN_PLAY_REASON, useInPlay } from '../../../behavior/useInPlay';
import { BOTTLE_HINTS, BOTTLE_ITEM_SLOT, BOTTLE_OPTIONS, BOTTLE_SLOTS } from '../PlayerTab.constants';
import type { BottleSlot } from '../PlayerTab.constants';

const SNES_TILE = 8;
/** A bottle is two tiles square, one tile from its neighbour and from the frame. */
const BOTTLE_TILES = 2;
const GAP_TILES = 1;
const INNER_COLS = GAP_TILES + BOTTLE_SLOTS.length * (BOTTLE_TILES + GAP_TILES);
const INNER_ROWS = BOTTLE_TILES + GAP_TILES * 2;

type BottleRackProps = {
  scale: number;
  spritesBase: string;
};

const spriteUrlOf = (spritesBase: string, value: number): string | null => {
  const file = getSlotSprite(BOTTLE_ITEM_SLOT, value);
  return file ? `${spritesBase}${file}.png` : null;
};

const labelOf = (value: number): string => BOTTLE_OPTIONS.find((o) => o.value === value)?.label ?? 'None';

const writeAll = (value: BottleContentsValue): void => {
  for (const slot of BOTTLE_SLOTS) cheatSetBottle(slot, value);
};

const BottleRack = ({ scale, spritesBase }: BottleRackProps) => {
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const [open, setOpen] = useState<{ slot: BottleSlot; anchor: HTMLElement } | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const hint = usePointerHintTarget('Bottles', BOTTLE_HINTS);
  const inPlay = useInPlay();

  const tile = SNES_TILE * scale;
  const size = BOTTLE_TILES * tile;

  const optionsFor = (slot: BottleSlot): ChoiceOption[] => BOTTLE_OPTIONS.map((option) => ({
    key: String(option.value),
    label: option.label,
    sprite: spriteUrlOf(spritesBase, option.value),
    current: bottles[slot] === option.value,
    tone: option.tone,
    onPick: () => cheatSetBottle(slot, option.value),
    onPickAll: () => writeAll(option.value),
    allHint: 'All four bottles',
  }));

  return (
    <Box className="cheats-player__bottles" data-locked={inPlay ? undefined : ''} title={inPlay ? undefined : IN_PLAY_REASON} {...hint}>
      <PauseBorderBox color="yellow" cols={INNER_COLS} rows={INNER_ROWS} scale={scale} spritesBase={spritesBase}>
        {BOTTLE_SLOTS.map((slot) => {
          const value = bottles[slot] ?? BottleContents.None;
          const isGhost = value === BottleContents.None;
          const sprite = spriteUrlOf(spritesBase, isGhost ? BottleContents.Empty : value);
          const style = { left: tile * (GAP_TILES + slot * (BOTTLE_TILES + GAP_TILES)), top: tile * GAP_TILES, width: size, height: size };
          return (
            <Button
              key={slot}
              variant="bare"
              className={`cheats-player__bottle${isGhost ? ' cheats-player__bottle--ghost' : ''}`}
              style={style}
              title={`Bottle ${slot + 1}: ${labelOf(value)}`}
              aria-haspopup="menu"
              aria-expanded={open?.slot === slot}
              disabled={!inPlay}
              onClick={(e) => setOpen({ slot, anchor: e.currentTarget })}
            >
              {sprite && <Image className="cheats-player__bottle-sprite" src={sprite} alt="" draggable={false} />}
            </Button>
          );
        })}
      </PauseBorderBox>
      {open && (
        <ChoicePopover
          title={`Bottle ${open.slot + 1}`}
          options={optionsFor(open.slot)}
          anchor={open.anchor}
          onClose={close}
          allLabel="x4"
        />
      )}
    </Box>
  );
};

export { BottleRack };
export type { BottleRackProps };
