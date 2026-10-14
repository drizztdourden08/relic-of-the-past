/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { PauseScreenTabs } from '../../../../composites/PauseScreenTabs';
import { MENU_INSET, SCREEN_TABS, SCREEN_Y, TABS_X, TABS_Y } from '../../EnhancedPauseView.constants';
import type { PauseScreenLayerProps } from '../../EnhancedPauseView.type';
import { PauseScreenHost } from '../PauseScreenHost';

const PauseScreenLayer = (props: PauseScreenLayerProps) => {
  const { nav, vitals, heartMode, scale, spritesBase } = props;
  const px = (n: number): number => n * scale;

  return (
    <>
      <HudBox
        className="enhanced-pause__plate"
        style={{ position: 'absolute', left: px(TABS_X), top: px(TABS_Y) }}
      >
        <PauseScreenTabs
          tabs={SCREEN_TABS}
          active={nav.screen}
          scale={scale}
          spritesBase={spritesBase}
          onSelect={nav.move.selectScreen}
        />
      </HudBox>

      <HudBox
        className="enhanced-pause__screen"
        style={{ position: 'absolute', left: px(MENU_INSET), top: px(SCREEN_Y) }}
      >
        <PauseScreenHost
          screen={nav.screen}
          section={nav.section}
          cursor={nav.cursor}
          items={nav.items}
          gear={nav.gear}
          dungeonItems={nav.dungeonItems}
          vitals={vitals}
          heartMode={heartMode}
          hintLines={nav.hintLines}
          scale={scale}
          spritesBase={spritesBase}
          onFocus={nav.move.focus}
          onConfirm={nav.move.confirm}
        />
      </HudBox>
    </>
  );
};

export { PauseScreenLayer };
