/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { PauseBottlePanel } from '../../../../compounds/PauseBottlePanel';
import { BOTTLE_PHASE_CLASS } from '../../PauseMenuView.constants';
import type { BottleColumnProps } from '../../PauseMenuView.type';
import './BottleColumn.css';

const BottleColumn = ({ data, bottleSlot, bottle, scale, spritesBase }: BottleColumnProps) => {
  if (!bottle.showBottlePanel) return null;

  return (
    <HudBox
      className={`pause-menu__bottle${BOTTLE_PHASE_CLASS[bottle.phase]}`}
      onAnimationEnd={bottle.onAnimationEnd}
    >
      <PauseBottlePanel
        bottles={data.bottles}
        selectedIndex={bottleSlot - 1}
        scale={scale}
        spritesBase={spritesBase}
      />
    </HudBox>
  );
};

export { BottleColumn };
