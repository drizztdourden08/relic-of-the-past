/* @layer renderer-app @kind component */
import { usePlatform } from '@app/platform';
import { Drawer } from '@drizztdourden08/tessera/composites';
import { buildTitleBarMenuItems } from '../TitleBar/behavior/title-bar-menu';
import { OptionsDrawer } from './sub-components/OptionsDrawer';
import { useMobileChrome } from './behavior/useMobileChrome';
import './MobileChrome.css';
import type { MobileChromeProps } from './MobileChrome.type';

const MobileChrome = (props: MobileChromeProps) => {
  const { window: win } = usePlatform();
  const { optionsOpen, closeOptions, fps } = useMobileChrome({
    gameRunning: props.gameRunning,
    activePage: props.activePage,
    onClosePage: props.onClosePage,
    onHome: () => { if (props.activeProfile) props.onShowProfile(); },
  });

  const groups = buildTitleBarMenuItems({ ...props, win, closeMenu: closeOptions });

  return (
    <Drawer open={optionsOpen} onClose={closeOptions} side="right" label="Options">
      <OptionsDrawer
        groups={groups}
        fps={fps}
        showFps={Boolean(props.showFps) && props.gameRunning}
        isMuted={Boolean(props.isMuted)}
        onToggleMute={props.onToggleMute}
      />
    </Drawer>
  );
};

export { MobileChrome };
