/* @layer renderer-components @kind types */
import type { WindowControlsPort } from '@shared/platform';
import type { DropdownMenu } from '@drizztdourden08/tessera/composites';
import type { TitleBarProps } from '../TitleBar.type';

type MenuItems = Parameters<typeof DropdownMenu>[0]['items'];

type MenuBuilderDeps = Pick<TitleBarProps,
  'activeProfile' | 'gameRunning' | 'onShowProfile' | 'onToggleSaveStates' | 'onShowDataManager'
  | 'onToggleInventory' | 'onToggleChecks' | 'onToggleCheats' | 'onShowLogs' | 'onToggleDebug'
  | 'onShowConnectionDebug' | 'onToggleDataset' | 'onToggleSimulator' | 'onToggleMusic' | 'onShowInputTester' | 'onShowHudLayout' | 'onShowSpriteDebug' | 'onShowDataInspector'
  | 'onShowShadowEditor' | 'onCheckForUpdates' | 'onShowCredits' | 'onShowDesignGallery' | 'onShowAbout' | 'onShowRandomizer'
  | 'widgetVisibility' | 'developerToolsEnabled'
> & { closeMenu: () => void; win: WindowControlsPort };

export type { MenuBuilderDeps, MenuItems };
