/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { ABILITY_GRID } from '../PauseAbilitiesPanel.constants';
import type { AbilityGridProps } from '../PauseAbilitiesPanel.type';
import { AbilityCell } from './AbilityCell';

const AbilityGrid = ({ abilityFlags, liftLevel, tile, spritesBase }: AbilityGridProps) => (
  <HudBox style={{
    position: 'absolute',
    top: tile * 2 / 3,
    left: tile * 2,
    width: tile * 16.7,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    height: tile * 4,
  }}>
    {ABILITY_GRID.map(({ label, bit }) => (
      <AbilityCell
        key={label}
        label={label}
        owned={(abilityFlags & (1 << bit)) !== 0}
        liftLevel={liftLevel}
        tile={tile}
        spritesBase={spritesBase}
      />
    ))}
  </HudBox>
);

export { AbilityGrid };
