/* @layer renderer-hud @kind logic */
import { EQUIP_SPRITES } from '../PauseEquipSlot.constants';
import { ALWAYS_SHOWN } from './equip-sprite.constants';

const equipSprite = (type: string, level: number): string | null => {
  const sprites = EQUIP_SPRITES[type];
  if (!sprites) return null;
  if (!ALWAYS_SHOWN.has(type) && level <= 0) return null;
  return sprites[Math.min(level, Math.max(...Object.keys(sprites).map(Number)))] ?? null;
};

export { equipSprite };
