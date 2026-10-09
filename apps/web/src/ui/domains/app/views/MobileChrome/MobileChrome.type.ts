/* @layer renderer-components @kind types */
import type { MenuGroup } from '@drizztdourden08/tessera/composites';
import type { PageId } from '@app/App/types';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';

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
  groups: readonly MenuGroup[];
  fps: number;
  showFps: boolean;
  isMuted: boolean;
  onToggleMute?: () => void;
}

export type { BackDeps, MobileChromeProps, OptionsDrawerProps };
