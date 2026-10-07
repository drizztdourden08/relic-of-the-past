/* @layer renderer-hud @kind component */
/** A single item in the pause menu item grid: 16×16 sprite or empty, highlighted when selected. */
import { useMemo } from 'react';
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { HudSprite } from '../../primitives/HudSprite';

const generateCircleDataUrl = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#00ff00';
  const cx = 15.5, cy = 15.5;
  const innerR = 11, outerR = 13;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= innerR && dist <= outerR) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas.toDataURL();
};

let _circleDataUrl: string | null = null;
const getCircleDataUrl = (): string => {
  if (!_circleDataUrl) _circleDataUrl = generateCircleDataUrl();
  return _circleDataUrl;
};

/**
 * Per-slot sprite mapping: save slot index → { value → sprite filename }.
 * Each inventory save slot stores a small value (0=empty, 1+=has/level).
 */
const SLOT_SPRITES: Record<number, Record<number, string>> = {
  0:  { 1: 'hud-bow-no-arrows', 2: 'hud-bow', 3: 'hud-silver-bow', 4: 'hud-silver-bow' },
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
  15: { 2: 'hud-bottle', 3: 'hud-bottle-red', 4: 'hud-bottle-green', 5: 'hud-bottle-blue', 6: 'hud-bottle-fairy', 7: 'hud-bottle-bee', 8: 'hud-bottle-good-bee' },
  16: { 1: 'hud-cane-of-somaria' },
  17: { 1: 'hud-cane-of-byrna' },
  18: { 1: 'hud-cape' },
  19: { 1: 'hud-magic-mirror', 2: 'hud-magic-mirror' },
};

const getSlotSprite = (saveSlotIndex: number, value: number): string | null => {
  if (value <= 0) return null;
  const slotMap = SLOT_SPRITES[saveSlotIndex];
  if (!slotMap) return null;
  return slotMap[value] ?? slotMap[1] ?? null;
};

interface PauseItemSlotProps {
  saveSlotIndex: number;
  itemValue: number;
  selected: boolean;
  animate?: boolean;
  scale: number;
  spritesBase: string;
}

const PauseItemSlot = ({ saveSlotIndex, itemValue, selected, animate = true, scale, spritesBase }: PauseItemSlotProps) => {
  const tile = 8 * scale;
  const size = 2 * tile; // 16×16 SNES px
  // Circle is 4×4 tiles (extends 1 tile beyond item on each side)
  const circleSize = 4 * tile;
  const circleOffset = -tile;

  const circleUrl = useMemo(() => selected ? getCircleDataUrl() : '', [selected]);
  const sprite = getSlotSprite(saveSlotIndex, itemValue);

  return (
    <HudBox style={{
      width: size,
      height: size,
      position: 'relative',
    }}>
      {/* Pixel-art selection circle, a native 32×32 sprite scaled up with pixelated rendering */}
      {selected && (
        <HudImage
          src={circleUrl}
          width={circleSize}
          height={circleSize}
          style={{
            position: 'absolute',
            top: circleOffset,
            left: circleOffset,
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            animation: animate ? 'pause-cursor-flash 533ms step-end infinite' : undefined,
          }}
        />
      )}
      {sprite && (
        <HudSprite
          src={`${spritesBase}${sprite}.png`}
          width={size}
          height={size}
          scale={scale}
          outline={false}
        />
      )}
    </HudBox>
  );
};

export { PauseItemSlot, SLOT_SPRITES, getSlotSprite, getCircleDataUrl };
export type { PauseItemSlotProps };
