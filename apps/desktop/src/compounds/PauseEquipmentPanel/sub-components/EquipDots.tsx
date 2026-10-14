/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import type { EquipDotsProps } from '../PauseEquipmentPanel.type';

const EquipDots = ({ tile, spritesBase }: EquipDotsProps) => (
  <HudBox style={{
    position: 'absolute',
    top: tile * 3,
    left: 0,
    width: tile * 8,
    height: tile,
    display: 'flex',
  }}>
    {Array.from({ length: 8 }, (_, i) => (
      <HudImage
        key={i}
        src={`${spritesBase}font-dot.png`}
        width={tile}
        height={tile}
        block
        pixelated
      />
    ))}
  </HudBox>
);

export { EquipDots };
