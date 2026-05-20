/**
 * PauseEquipSlot — renders an equipment item (sword, shield, armor, etc.)
 * with its level-dependent sprite. 16×16 SNES pixels.
 */

/** Maps equipment type + level to sprite filename */
const EQUIP_SPRITES: Record<string, Record<number, string>> = {
  sword: { 1: 'hud-fighter-sword', 2: 'hud-master-sword', 3: 'hud-tempered-sword', 4: 'hud-golden-sword' },
  shield: { 1: 'hud-fighters-shield', 2: 'hud-fire-shield', 3: 'hud-mirror-shield' },
  armor: { 1: 'hud-blue-mail', 2: 'hud-red-mail' },
  gloves: { 1: 'hud-power-glove', 2: 'hud-titans-mitts' },
  boots: { 1: 'hud-pegasus-boots' },
  flippers: { 1: 'hud-flippers' },
  moonPearl: { 1: 'hud-moon-pearl' },
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
  const sprite = level > 0 ? sprites[Math.min(level, Math.max(...Object.keys(sprites).map(Number)))] : null;

  if (!sprite) return <div style={{ width: size, height: size }} />;

  return (
    <img
      src={`${spritesBase}${sprite}.png`}
      width={size}
      height={size}
      draggable={false}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseEquipSlot, EQUIP_SPRITES };
export type { PauseEquipSlotProps };
