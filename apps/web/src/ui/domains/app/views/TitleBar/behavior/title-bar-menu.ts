/* @layer renderer-components @kind logic */
/** Builds the TitleBar dropdown menu item tree from props + closeMenu. */
import type { WindowControlsPort } from '@shared/platform';
import type { DropdownMenu } from '../../../../../design-system/composites/DropdownMenu';
import type { TitleBarProps } from '../TitleBar.type';

type MenuItems = Parameters<typeof DropdownMenu>[0]['items'];

type MenuBuilderDeps = Pick<TitleBarProps,
  'activeProfile' | 'gameRunning' | 'onShowProfile' | 'onToggleSaveStates' | 'onShowDataManager'
  | 'onToggleInventory' | 'onToggleChecks' | 'onToggleCheats' | 'onShowLogs' | 'onToggleDebug'
  | 'onShowConnectionDebug' | 'onToggleDataset' | 'onToggleSimulator' | 'onShowInputTester' | 'onShowSpriteDebug' | 'onShowDataInspector'
  | 'onShowShadowEditor' | 'onCheckForUpdates' | 'onShowCredits' | 'onShowDesignGallery' | 'onShowAbout'
  | 'widgetVisibility'
> & { closeMenu: () => void; win: WindowControlsPort };

const buildTitleBarMenuItems = (deps: MenuBuilderDeps): MenuItems => {
  const {
    closeMenu, win, activeProfile, gameRunning,
    onShowProfile, onToggleSaveStates, onShowDataManager, onToggleInventory, onToggleChecks,
    onToggleCheats, onShowLogs, onToggleDebug, onShowConnectionDebug, onToggleDataset, onToggleSimulator,
    onShowInputTester, onShowSpriteDebug, onShowDataInspector, onShowShadowEditor, onCheckForUpdates, onShowCredits, onShowDesignGallery, onShowAbout,
    widgetVisibility = {},
  } = deps;

  return [
    {
      key: 'home',
      icon: '🏠',
      label: 'Home',
      disabled: !activeProfile,
      onClick: () => { closeMenu(); onShowProfile(); },
    },
    {
      key: 'save-states',
      icon: '💾',
      label: 'Save States',
      disabled: !gameRunning,
      onClick: () => { closeMenu(); onToggleSaveStates(); },
    },
    'separator',
    {
      key: 'data',
      icon: '📦',
      label: 'Data',
      children: [
        { key: 'data-home', icon: '🏠', label: 'Home', onClick: () => { closeMenu(); onShowDataManager('home'); } },
        { key: 'profiles', icon: '👤', label: 'Profiles', onClick: () => { closeMenu(); onShowDataManager('profiles'); } },
        { key: 'roms', icon: '🎮', label: 'ROMs', onClick: () => { closeMenu(); onShowDataManager('roms'); } },
        { key: 'languages', icon: '🌐', label: 'Languages', onClick: () => { closeMenu(); onShowDataManager('languages'); } },
        { key: 'msu', icon: '🎵', label: 'MSU', onClick: () => { closeMenu(); onShowDataManager('msu'); } },
        { key: 'sprites', icon: '🖼️', label: 'Sprites', onClick: () => { closeMenu(); onShowDataManager('sprites'); } },
        { key: 'player-sprites', icon: '🧝', label: 'Player Sprites', onClick: () => { closeMenu(); onShowDataManager('linkSprites'); } },
      ],
    },
    {
      key: 'widgets',
      icon: '🔧',
      label: 'Widgets',
      children: [
        { key: 'inventory', icon: '🎒', label: 'Inventory Tracker', checked: widgetVisibility.inventory, onClick: () => { closeMenu(); onToggleInventory(); } },
        { key: 'checks', icon: '🗺️', label: 'Checks Tracker', checked: widgetVisibility.checks, onClick: () => { closeMenu(); onToggleChecks(); } },
        { key: 'cheats', icon: '⚡', label: 'Cheats', checked: widgetVisibility.cheats, onClick: () => { closeMenu(); onToggleCheats(); } },
        { key: 'logs', icon: '📋', label: 'Logs', checked: widgetVisibility.logs, onClick: () => { closeMenu(); onShowLogs(); } },
        { key: 'debug', icon: '📡', label: 'Game State', checked: widgetVisibility.debug, onClick: () => { closeMenu(); onToggleDebug(); } },
        { key: 'navigation', icon: '🔗', label: 'Location & Navigation', checked: widgetVisibility.navigation, onClick: () => { closeMenu(); onShowConnectionDebug(); } },
        { key: 'dataset', icon: '📊', label: 'Dataset & Mapping', checked: widgetVisibility.dataset, onClick: () => { closeMenu(); onToggleDataset(); } },
        { key: 'simulator', icon: '🤖', label: 'Simulator', checked: widgetVisibility.simulator, onClick: () => { closeMenu(); onToggleSimulator(); } },
      ],
    },
    {
      key: 'advanced',
      icon: '⚙️',
      label: 'Advanced',
      children: [
        // Input Calibration and Data Inspector are real user options — always available.
        // The rest are developer tools, shown only in a dev build (and inherently desktop-only).
        { key: 'input-tester', icon: '🎮', label: 'Input Calibration', onClick: () => { closeMenu(); onShowInputTester(); } },
        { key: 'data-inspector', icon: '🔍', label: 'Data Inspector', onClick: () => { closeMenu(); onShowDataInspector(); } },
        ...(window.api.isDev ? [
          { key: 'dev-console', icon: '🛠️', label: 'Dev Console', onClick: () => { closeMenu(); win.openDevTools(); } },
          { key: 'sprite-debug', icon: '🖼️', label: 'Sprite Debug', onClick: () => { closeMenu(); onShowSpriteDebug(); } },
          { key: 'design-gallery', icon: '🎨', label: 'Design Gallery', onClick: () => { closeMenu(); onShowDesignGallery(); } },
          { key: 'shadow-editor', icon: '🌓', label: 'Shadow Editor', onClick: () => { closeMenu(); onShowShadowEditor(); } },
        ] : []),
      ],
    },
    'separator',
    ...(onCheckForUpdates ? [{
      key: 'check-updates',
      icon: '🔄',
      label: 'Check for Updates',
      onClick: () => { closeMenu(); onCheckForUpdates(); },
    }] : []),
    {
      key: 'credits',
      icon: '📜',
      label: 'Credits',
      onClick: () => { closeMenu(); onShowCredits(); },
    },
    {
      key: 'about',
      icon: 'ℹ️',
      label: 'About',
      onClick: () => { closeMenu(); onShowAbout(); },
    },
    { key: 'quit', icon: '✕', label: 'Quit', onClick: () => win.close() },
  ];
};

export { buildTitleBarMenuItems };
