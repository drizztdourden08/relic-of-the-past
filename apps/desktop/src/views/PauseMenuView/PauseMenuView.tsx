/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { usePauseMenu } from '../../hooks/usePauseMenu';
import { PauseItemGrid } from '../../compounds/PauseItemGrid';
import { PauseNamePanel } from '../../compounds/PauseNamePanel';
import { PauseAbilitiesPanel } from '../../compounds/PauseAbilitiesPanel';
import { useBottlePhase } from './behavior/useBottlePhase';
import { useMenuScale } from './behavior/useMenuScale';
import { useMenuSelection } from './behavior/useMenuSelection';
import { BottleColumn } from './sub-components/BottleColumn';
import { StatusPanels } from './sub-components/StatusPanels';
import type { PauseMenuViewProps } from './PauseMenuView.type';
import './PauseMenuView.css';

const PauseMenuView = ({ slideTransform, slideTransition }: PauseMenuViewProps = {}) => {
  const { containerRef, scale } = useMenuScale();
  const { data, config } = usePauseMenu(scale);
  const { spritesBase } = config;
  const selection = useMenuSelection(data);
  const bottle = useBottlePhase(selection.isBottleSelected);
  const tile = 8 * scale;

  return (
    <HudBox
      ref={containerRef}
      className="pause-menu"
      style={{ transform: slideTransform, transition: slideTransition }}
    >
      <HudBox className="pause-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(32, ${tile}px)`,
        gridTemplateRows: `repeat(28, ${tile}px)`,
      }}>
        <PauseItemGrid
          items={selection.displayItems}
          selectedIndex={selection.selectedSaveIdx}
          staticSelection={selection.isBottleSelected}
          spritesBase={spritesBase}
          scale={scale}
          className="pause-menu__items"
        />

        <PauseNamePanel
          itemName={selection.nameLines}
          itemSprite={selection.itemSprite}
          borderColor={bottle.showBottlePanel ? 'yellow' : 'green'}
          spritesBase={spritesBase}
          scale={scale}
          className="pause-menu__name"
        />

        <BottleColumn data={data} bottleSlot={selection.bottleSlot} bottle={bottle} scale={scale} spritesBase={spritesBase} />
        {bottle.showNormalPanels && <StatusPanels data={data} scale={scale} spritesBase={spritesBase} />}

        <PauseAbilitiesPanel
          gloves={data.gloves}
          boots={data.boots}
          flippers={data.flippers}
          moonPearl={data.moonPearl}
          abilityFlags={selection.abilityFlags}
          spritesBase={spritesBase}
          scale={scale}
          className="pause-menu__abilities"
        />
      </HudBox>
    </HudBox>
  );
};

export { PauseMenuView };
