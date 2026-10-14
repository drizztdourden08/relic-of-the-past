/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import type { AbilityCellProps } from '../PauseAbilitiesPanel.type';
import './AbilityCell.css';

const AbilityCell = ({ label, owned, liftLevel, tile, spritesBase }: AbilityCellProps) => (
  <HudBox className="pause-ability-cell">
    {owned && label.split('').map((ch, i) => (
      <HudImage
        key={i}
        src={`${spritesBase}font-letter-${ch.toLowerCase()}.png`}
        width={tile}
        height={tile}
        block
        pixelated
      />
    ))}
    {owned && label === 'LIFT' && (
      <HudImage
        src={`${spritesBase}font-level-${liftLevel}.png`}
        width={tile}
        height={tile}
        block
        pixelated
      />
    )}
  </HudBox>
);

export { AbilityCell };
