/**
 * PauseItemSlot — a single item in the pause menu item grid.
 * Displays 16×16 item sprite or empty. Highlights the currently selected item.
 */
import { HudSprite } from '../../primitives/HudSprite';

/**
 * Per-slot sprite mapping: save slot index → { value → sprite filename }.
 * Each inventory save slot stores a small value (0=empty, 1+=has/level).
 */
const SLOT_SPRITES: Record<number, Record<number, string>> = {
  0:  { 1: 'hud-bow', 2: 'hud-silver-bow', 3: 'hud-bow', 4: 'hud-silver-bow' },
  1:  { 1: 'hud-blue-boomerang', 2: 'hud-red-boomerang' },
  2:  { 1: 'hud-hookshot' },
  3:  { 1: 'hud-bombs' },
  4:  { 1: 'hud-mushroom', 2: 'hud-magic-powder' },
  5:  { 1: 'hud-fire-rod' },
  6:  { 1: 'hud-ice-rod' },
  7:  { 1: 'hud-bombos' },
  8:  { 1: 'hud-ether' },
  9:  { 1: 'hud-quake' },
  10: { 1: 'hud-lamp' },
  11: { 1: 'hud-hammer' },
  12: { 1: 'hud-shovel', 2: 'hud-flute', 3: 'hud-flute' },
  13: { 1: 'hud-bug-net' },
  14: { 1: 'hud-book-of-mudora' },
  15: { 1: 'hud-bottle' },
  16: { 1: 'hud-cane-of-somaria' },
  17: { 1: 'hud-cane-of-byrna' },
  18: { 1: 'hud-cape' },
  19: { 1: 'hud-magic-mirror', 2: 'hud-magic-mirror' },
};

/** Resolve sprite name for a given save slot + value */
function getSlotSprite(saveSlotIndex: number, value: number): string | null {
  if (value <= 0) return null;
  const slotMap = SLOT_SPRITES[saveSlotIndex];
  if (!slotMap) return null;
  return slotMap[value] ?? slotMap[1] ?? null;
}

interface PauseItemSlotProps {
  saveSlotIndex: number;
  itemValue: number;
  selected: boolean;
  scale: number;
  spritesBase: string;
}

const PauseItemSlot = ({ saveSlotIndex, itemValue, selected, scale, spritesBase }: PauseItemSlotProps) => {
  const tile = 8 * scale;
  const size = 2 * tile; // 16×16 SNES px

  const sprite = getSlotSprite(saveSlotIndex, itemValue);

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      boxShadow: selected ? `inset 0 0 0 ${Math.max(1, scale)}px #fff, 0 0 ${tile * 0.5}px rgba(255,255,255,0.5)` : undefined,
    }}>
      {sprite && (
        <HudSprite
          src={`${spritesBase}${sprite}.png`}
          width={size}
          height={size}
          scale={scale}
          outline={false}
        />
      )}
    </div>
  );
};

export { PauseItemSlot, SLOT_SPRITES, getSlotSprite };
export type { PauseItemSlotProps };
