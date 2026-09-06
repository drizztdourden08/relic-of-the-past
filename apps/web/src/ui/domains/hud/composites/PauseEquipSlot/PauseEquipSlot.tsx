/* @layer renderer-hud @kind component */
/**
 * Renders an equipment item (sword, shield, armor, etc.) with its
 * level-dependent sprite. 16×16 SNES pixels.
 */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';

/** Maps equipment type + level to sprite filename */
const EQUIP_SPRITES: Record<string, Record<number, string>> = {
  sword: { 1: 'hud-fighter-sword', 2: 'hud-master-sword', 3: 'hud-tempered-sword', 4: 'hud-golden-sword' },
  shield: { 1: 'hud-fighters-shield', 2: 'hud-fire-shield', 3: 'hud-mirror-shield' },
  armor: { 0: 'hud-green-mail', 1: 'hud-blue-mail', 2: 'hud-red-mail' },
  gloves: { 1: 'hud-power-glove', 2: 'hud-titans-mitts' },
  boots: { 1: 'hud-pegasus-boots' },
  flippers: { 1: 'hud-flippers' },
  moonPearl: { 1: 'hud-moon-pearl' },
  heartPiece: { 0: 'hud-heart-piece-0', 1: 'hud-heart-piece-1', 2: 'hud-heart-piece-2', 3: 'hud-heart-piece-3' },
  dungeonMap: { 1: 'hud-map' },
  compass: { 1: 'hud-compass' },
  bigKey: { 1: 'hud-big-key' },
};

interface PauseEquipSlotProps {
  type: keyof typeof EQUIP_SPRITES;
  level: number;
  scale: number;
  spritesBase: string;
}

const PauseEquipSlot = ({ type, level, scale, spritesBase }: PauseEquipSlotProps) => {
  const size = 16 * scale;
  const sprites = EQUIP_SPRITES[type];
  if (!sprites) return <HudBox style={{ width: size, height: size }} />;

  // heartPiece and armor always render (including level 0)
  const alwaysRender = type === 'heartPiece' || type === 'armor';
  const sprite = alwaysRender
    ? sprites[Math.min(level, Math.max(...Object.keys(sprites).map(Number)))]
    : (level > 0 ? sprites[Math.min(level, Math.max(...Object.keys(sprites).map(Number)))] : null);

  if (!sprite) return <HudBox style={{ width: size, height: size }} />;

  return (
    <HudImage
      src={`${spritesBase}${sprite}.png`}
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseEquipSlot, EQUIP_SPRITES };
export type { PauseEquipSlotProps };
