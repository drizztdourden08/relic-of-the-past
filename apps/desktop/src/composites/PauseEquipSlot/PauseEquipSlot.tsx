/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { EQUIP_SPRITES } from './PauseEquipSlot.constants';
import type { PauseEquipSlotProps } from './PauseEquipSlot.type';

const PauseEquipSlot = ({ type, level, scale, spritesBase }: PauseEquipSlotProps) => {
  const size = 16 * scale;
  const sprites = EQUIP_SPRITES[type];
  if (!sprites) return <HudBox style={{ width: size, height: size }} />;

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

export { PauseEquipSlot };
