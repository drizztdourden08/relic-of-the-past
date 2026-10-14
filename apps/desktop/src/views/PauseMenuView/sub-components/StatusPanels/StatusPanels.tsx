/* @layer renderer-hud @kind component */
import { PauseProgressPanel } from '../../../../compounds/PauseProgressPanel';
import { PauseEquipmentPanel } from '../../../../compounds/PauseEquipmentPanel';
import type { StatusPanelsProps } from '../../PauseMenuView.type';
import './StatusPanels.css';

const StatusPanels = ({ data, scale, spritesBase }: StatusPanelsProps) => (
  <>
    <PauseProgressPanel
      pendants={data.pendants}
      crystals={data.crystals}
      showCrystals={data.showCrystals}
      spritesBase={spritesBase}
      scale={scale}
      className="pause-menu__progress"
    />

    <PauseEquipmentPanel
      sword={data.sword}
      shield={data.shield}
      armor={data.armor}
      heartPieces={data.heartPieces}
      isInDungeon={data.isInDungeon}
      bigKeys={data.bigKeys}
      maps={data.maps}
      compasses={data.compasses}
      palaceIndex={data.palaceIndex}
      spritesBase={spritesBase}
      scale={scale}
      className="pause-menu__equipment"
    />
  </>
);

export { StatusPanels };
