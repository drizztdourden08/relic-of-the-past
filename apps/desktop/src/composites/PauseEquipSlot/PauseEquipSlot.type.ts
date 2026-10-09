/* @layer renderer-hud @kind types */
import type { EQUIP_SPRITES } from './PauseEquipSlot.constants';

interface PauseEquipSlotProps {
  type: keyof typeof EQUIP_SPRITES;
  level: number;
  scale: number;
  spritesBase: string;
}

export type { PauseEquipSlotProps };
