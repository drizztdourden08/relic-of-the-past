/* @layer renderer-components @kind types */
import type { PageId } from '@app/App/types';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';

interface DrawerMenuItem {
  key: string;
  icon?: string;
  label: string;
  onClick?: () => void;
  checked?: boolean;
  disabled?: boolean;
  children?: DrawerMenuItem[];
}

interface MobileChromeProps extends TitleBarProps {
  activePage: PageId;
  onClosePage: () => void;
}

interface BackDeps {
  gameRunning: boolean;
  activePage: PageId;
  onClosePage: () => void;
  onHome: () => void;
}

interface OptionsDrawerProps {
  items: DrawerMenuItem[];
  fps: number;
  showFps: boolean;
  isMuted: boolean;
  onToggleMute?: () => void;
}

export type { BackDeps, DrawerMenuItem, MobileChromeProps, OptionsDrawerProps };
