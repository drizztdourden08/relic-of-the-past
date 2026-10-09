/* @layer renderer-widgets @kind component */
import { useCallback, useState } from 'react';
import { Box, Image, Pressable } from '@drizztdourden08/tessera/primitives';
import { PauseBorderBox } from '@app/hud';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { BottleContents, cheatSetBottle } from '@app/game';
import type { BottleContentsValue } from '@app/game';
import { ChoicePopover } from '../../../sub-components/ChoicePopover';
import type { ChoiceOption } from '../../../sub-components/ChoicePopover.type';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { useInPlay } from '../../../behavior/useInPlay';
import { IN_PLAY_REASON } from '../../../CheatsWidget.constants';
import {
  BOTTLE_GAP_TILES, BOTTLE_HINTS, BOTTLE_INNER_COLS, BOTTLE_INNER_ROWS, BOTTLE_ITEM_SLOT, BOTTLE_OPTIONS, BOTTLE_SLOTS, BOTTLE_TILES, SNES_TILE,
} from '../PlayerTab.constants';
import type { BottleSlot, HudPieceProps, OpenBottle } from '../PlayerTab.type';

const spriteUrlOf = (spritesBase: string, value: number): string | null => {
  const file = getSlotSprite(BOTTLE_ITEM_SLOT, value);
  return file ? `${spritesBase}${file}.png` : null;
};

const labelOf = (value: number): string => BOTTLE_OPTIONS.find((o) => o.value === value)?.label ?? 'None';

const writeAll = (value: BottleContentsValue): void => {
  for (const slot of BOTTLE_SLOTS) cheatSetBottle(slot, value);
};

const BottleRack = ({ scale, spritesBase }: HudPieceProps) => {
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const [open, setOpen] = useState<OpenBottle | null>(null);
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
      <PauseBorderBox color="yellow" cols={BOTTLE_INNER_COLS} rows={BOTTLE_INNER_ROWS} scale={scale} spritesBase={spritesBase}>
        {BOTTLE_SLOTS.map((slot) => {
          const value = bottles[slot] ?? BottleContents.None;
          const isGhost = value === BottleContents.None;
          const sprite = spriteUrlOf(spritesBase, isGhost ? BottleContents.Empty : value);
          const style = { left: tile * (BOTTLE_GAP_TILES + slot * (BOTTLE_TILES + BOTTLE_GAP_TILES)), top: tile * BOTTLE_GAP_TILES, width: size, height: size };
          return (
            <Pressable
              key={slot}
              className={`cheats-player__bottle${isGhost ? ' cheats-player__bottle--ghost' : ''}`}
              style={style}
              title={`Bottle ${slot + 1}: ${labelOf(value)}`}
              aria-haspopup="menu"
              aria-expanded={open?.slot === slot}
              disabled={!inPlay}
              onClick={(e) => setOpen({ slot, anchor: e.currentTarget })}
            >
              {sprite && <Image className="cheats-player__bottle-sprite" src={sprite} alt="" draggable={false} />}
            </Pressable>
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
