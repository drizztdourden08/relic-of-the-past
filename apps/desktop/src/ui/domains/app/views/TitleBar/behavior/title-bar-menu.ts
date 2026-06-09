/* @layer renderer-components @kind logic */
/** Builds the TitleBar dropdown menu item tree from props + closeMenu. */
import type { DropdownMenu } from '../../../../../design-system/composites/DropdownMenu';
import type { TitleBarProps } from '../TitleBar.type';

type MenuItems = Parameters<typeof DropdownMenu>[0]['items'];

type MenuBuilderDeps = Pick<TitleBarProps,
  'activeProfile' | 'gameRunning' | 'onShowProfile' | 'onToggleSaveStates' | 'onShowDataManager'
  | 'onToggleInventory' | 'onToggleChecks' | 'onToggleCheats' | 'onShowLogs' | 'onToggleDebug'
  | 'onShowConnectionDebug' | 'onToggleDataset' | 'onShowInputTester' | 'onShowSpriteDebug'
  | 'onShowShadowEditor' | 'onCheckForUpdates' | 'onShowCredits' | 'onShowDesignGallery' | 'onShowAbout'
  | 'widgetVisibility'
> & { closeMenu: () => void };

const buildTitleBarMenuItems = (deps: MenuBuilderDeps): MenuItems => {
  const {
    closeMenu, activeProfile, gameRunning,
    onShowProfile, onToggleSaveStates, onShowDataManager, onToggleInventory, onToggleChecks,
    onToggleCheats, onShowLogs, onToggleDebug, onShowConnectionDebug, onToggleDataset,
    onShowInputTester, onShowSpriteDebug, onShowShadowEditor, onCheckForUpdates, onShowCredits, onShowDesignGallery, onShowAbout,
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
        { key: 'profiles', icon: '👤', label: 'Profiles', onClick: () => { closeMenu(); onShowDataManager('profiles'); } },
        { key: 'roms', icon: '🎮', label: 'ROMs', onClick: () => { closeMenu(); onShowDataManager('roms'); } },
        { key: 'languages', icon: '🌐', label: 'Languages', onClick: () => { closeMenu(); onShowDataManager('languages'); } },
        { key: 'msu', icon: '🎵', label: 'MSU', onClick: () => { closeMenu(); onShowDataManager('msu'); } },
        { key: 'sprites', icon: '🖼️', label: 'Sprites', onClick: () => { closeMenu(); onShowDataManager('sprites'); } },
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
        { key: 'debug', icon: '🐛', label: 'Debug State', checked: widgetVisibility.debug, onClick: () => { closeMenu(); onToggleDebug(); } },
        { key: 'navigation', icon: '🔗', label: 'Location & Navigation', checked: widgetVisibility.navigation, onClick: () => { closeMenu(); onShowConnectionDebug(); } },
        { key: 'dataset', icon: '📊', label: 'Dataset & Mapping', checked: widgetVisibility.dataset, onClick: () => { closeMenu(); onToggleDataset(); } },
      ],
    },
    {
      key: 'advanced',
      icon: '⚙️',
      label: 'Advanced',
      children: [
        { key: 'input-tester', icon: '🎮', label: 'Input Calibration', onClick: () => { closeMenu(); onShowInputTester(); } },
        { key: 'dev-console', icon: '🛠️', label: 'Dev Console', onClick: () => { closeMenu(); window.api.openDevTools(); } },
        { key: 'sprite-debug', icon: '🖼️', label: 'Sprite Debug', onClick: () => { closeMenu(); onShowSpriteDebug(); } },
        { key: 'design-gallery', icon: '🎨', label: 'Design Gallery', onClick: () => { closeMenu(); onShowDesignGallery(); } },
        ...(window.api.isDev ? [{ key: 'shadow-editor', icon: '🌓', label: 'Shadow Editor', onClick: () => { closeMenu(); onShowShadowEditor(); } }] : []),
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
    { key: 'quit', icon: '✕', label: 'Quit', onClick: () => window.api.close() },
  ];
};

export { buildTitleBarMenuItems };
