/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';
import { PauseLabel } from '../../primitives/PauseLabel';
import { INNER_COLS, INNER_ROWS } from './PauseAbilitiesPanel.constants';
import type { PauseAbilitiesPanelProps } from './PauseAbilitiesPanel.type';
import { AbilityGrid } from './sub-components/AbilityGrid';

const PauseAbilitiesPanel = (props: PauseAbilitiesPanelProps) => {
  const { gloves, boots, flippers, moonPearl, abilityFlags, scale, spritesBase, className } = props;
  const tile = 8 * scale;

  return (
    <HudBox layout="relative" className={className}>
    <PauseBorderBox color="red" cols={INNER_COLS} rows={INNER_ROWS} scale={scale} spritesBase={spritesBase}>
      <HudBox layout="at-origin">
        <PauseButtonLabel button="a" scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <AbilityGrid abilityFlags={abilityFlags} liftLevel={gloves + 1} tile={tile} spritesBase={spritesBase} />

      <HudBox style={{
        position: 'absolute',
        top: tile * 5,
        left: tile * 2,
        width: tile * 14,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <PauseEquipSlot type="boots" level={boots} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="gloves" level={gloves} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="flippers" level={flippers} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="moonPearl" level={moonPearl} scale={scale} spritesBase={spritesBase} />
      </HudBox>
    </PauseBorderBox>
    <HudBox style={{ position: 'absolute', top: 0, left: tile * 2, zIndex: 1, background: 'black' }}>
      <PauseLabel name="do" tiles={2} scale={scale} spritesBase={spritesBase} />
    </HudBox>
    </HudBox>
  );
};

export { PauseAbilitiesPanel };
