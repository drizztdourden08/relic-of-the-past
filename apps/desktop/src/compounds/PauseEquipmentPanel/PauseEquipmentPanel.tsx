/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';
import { dungeonFlags } from './behavior/dungeon-flags';
import type { PauseEquipmentPanelProps } from './PauseEquipmentPanel.type';
import { EquipDots } from './sub-components/EquipDots';
import { EquipFooter } from './sub-components/EquipFooter';

const PauseEquipmentPanel = (props: PauseEquipmentPanelProps) => {
  const { sword, shield, armor, heartPieces, isInDungeon, scale, spritesBase, className } = props;
  const tile = 8 * scale;
  const flags = dungeonFlags(props);

  return (
    <PauseBorderBox color="yellow" cols={8} rows={7} scale={scale} spritesBase={spritesBase} className={className}>
      <HudBox layout="at-origin">
        <PauseLabel name="equipment" tiles={5} scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <HudBox style={{ position: 'absolute', top: tile, left: 0 }}>
        <PauseEquipSlot type="sword" level={sword} scale={scale} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{ position: 'absolute', top: tile, left: tile * 3 }}>
        <PauseEquipSlot type="shield" level={shield} scale={scale} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{ position: 'absolute', top: tile, left: tile * 6 }}>
        <PauseEquipSlot type="armor" level={armor} scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <EquipDots tile={tile} spritesBase={spritesBase} />
      <EquipFooter
        isInDungeon={isInDungeon}
        heartPieces={heartPieces}
        hasMap={flags.hasMap}
        hasCompass={flags.hasCompass}
        hasBigKey={flags.hasBigKey}
        scale={scale}
        spritesBase={spritesBase}
      />
    </PauseBorderBox>
  );
};

export { PauseEquipmentPanel };
