/* @layer renderer-app @kind component */
/**
 * The mobile replacement for the desktop TitleBar (rendered when
 * !windowChrome). The Android back gesture/button opens the Options drawer (the full
 * menu plus FPS, quick mute and Quit); Home lives inside it. Back
 * also closes the drawer first, then any open page, mirroring desktop Esc. Reuses the
 * same callbacks + menu model as TitleBar.
 */
import { usePlatform } from '@app/platform';
import { Drawer } from '@ds/composites/Drawer';
import { buildTitleBarMenuItems } from '../TitleBar/behavior/title-bar-menu';
import { OptionsDrawer } from './sub-components/OptionsDrawer';
import { useMobileChrome } from './behavior/useMobileChrome';
import './MobileChrome.css';
import type { PageId } from '@app/App/types';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';
import type { DrawerMenuItem } from './MobileChrome.type';

interface MobileChromeProps extends TitleBarProps {
  activePage: PageId;
  onClosePage: () => void;
}

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
