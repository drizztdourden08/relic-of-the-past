/* @layer renderer-components @kind types */
import type { WindowControlsPort } from '@shared/platform';
import type { TitleBarProps } from '../TitleBar.type';

type MenuBuilderDeps = Pick<TitleBarProps,
  'activeProfile' | 'gameRunning' | 'onShowProfile' | 'onToggleSaveStates' | 'onShowDataManager'
  | 'onToggleInventory' | 'onToggleChecks' | 'onToggleCheats' | 'onShowLogs' | 'onToggleDebug'
  | 'onShowConnectionDebug' | 'onToggleDataset' | 'onToggleSimulator' | 'onToggleMusic' | 'onShowInputTester' | 'onShowHudLayout' | 'onShowSpriteDebug' | 'onShowDataInspector'
  | 'onShowShadowEditor' | 'onCheckForUpdates' | 'onShowCredits' | 'onShowAbout' | 'onShowRandomizer'
  | 'widgetVisibility' | 'developerToolsEnabled'
> & { closeMenu: () => void; win: WindowControlsPort };

export type { MenuBuilderDeps };
