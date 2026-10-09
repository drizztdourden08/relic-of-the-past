/* @layer renderer-app @kind component */
import { usePlatform } from '@app/platform';
import { Drawer } from '@ds/composites/Drawer';
import { buildTitleBarMenuItems } from '../TitleBar/behavior/title-bar-menu';
import { OptionsDrawer } from './sub-components/OptionsDrawer';
import { useMobileChrome } from './behavior/useMobileChrome';
import './MobileChrome.css';
import type { DrawerMenuItem, MobileChromeProps } from './MobileChrome.type';

const MobileChrome = (props: MobileChromeProps) => {
  const { window: win } = usePlatform();
  const { optionsOpen, closeOptions, fps } = useMobileChrome({
    gameRunning: props.gameRunning,
    activePage: props.activePage,
    onClosePage: props.onClosePage,
    onHome: () => { if (props.activeProfile) props.onShowProfile(); },
  });

  const items = buildTitleBarMenuItems(
    { ...props, win, closeMenu: closeOptions } as Parameters<typeof buildTitleBarMenuItems>[0],
  ).filter((item): item is Exclude<typeof item, string> => item !== 'separator') as unknown as DrawerMenuItem[];

  return (
    <Drawer open={optionsOpen} onClose={closeOptions} side="right" label="Options">
      <OptionsDrawer
        items={items}
        fps={fps}
        showFps={!!props.showFps && props.gameRunning}
        isMuted={!!props.isMuted}
        onToggleMute={props.onToggleMute}
      />
    </Drawer>
  );
};

export { MobileChrome };
