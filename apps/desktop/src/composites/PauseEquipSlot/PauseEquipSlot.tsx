/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { equipSprite } from './behavior/equip-sprite';
import type { PauseEquipSlotProps } from './PauseEquipSlot.type';

const PauseEquipSlot = ({ type, level, scale, spritesBase }: PauseEquipSlotProps) => {
  const size = 16 * scale;
  const sprite = equipSprite(type, level);

  if (!sprite) return <HudBox style={{ width: size, height: size }} />;

  return (
    <HudImage
      src={`${spritesBase}${sprite}.png`}
      width={size}
      height={size}
      block
      pixelated
    />
  );
};

export { PauseEquipSlot };
