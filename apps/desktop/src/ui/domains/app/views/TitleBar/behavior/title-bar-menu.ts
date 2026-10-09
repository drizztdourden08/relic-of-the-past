/* @layer renderer-components @kind logic */
import type { MenuGroup, MenuItem } from '@drizztdourden08/tessera/composites';
import { getWidgetDefinition } from '@drizztdourden08/tessera/composites';
import { WIDGET_DEFINITIONS } from '@app/App/widgets/widget-definitions.constants';
import type { MenuBuilderDeps } from './title-bar-menu.type';

const buildWidgetItems = (deps: MenuBuilderDeps): MenuItem[] => {
  const {
    closeMenu, onToggleInventory, onToggleChecks, onToggleCheats, onShowLogs, onToggleDebug,
    onShowConnectionDebug, onToggleDataset, onToggleSimulator, onToggleMusic, widgetVisibility = {}, developerToolsEnabled = false,
  } = deps;
  const check = (id: string, label: string, icon: MenuItem['icon'], run: () => void): MenuItem => ({
    id, label, icon, kind: 'check', checked: !!widgetVisibility[id], onSelect: () => { closeMenu(); run(); },
  });
  return [
    check('inventory', 'Inventory Tracker', 'package', onToggleInventory),
    check('checks', 'Checks Tracker', 'map', onToggleChecks),
    check('cheats', 'Cheats', 'zap', onToggleCheats),
    check('logs', 'Logs', 'file-text', onShowLogs),
    check('debug', 'Game State', 'radio', onToggleDebug),
    check('navigation', 'Location & Navigation', 'compass', onShowConnectionDebug),
    check('dataset', 'Live Data Inspector', 'layers', onToggleDataset),
    check('simulator', 'Simulator', 'play', onToggleSimulator),
    check('music', 'Music Debugger', 'headphones', onToggleMusic),
  ].filter((item) => developerToolsEnabled || !getWidgetDefinition(WIDGET_DEFINITIONS, item.id)?.devOnly);
};

const buildDataItems = (deps: MenuBuilderDeps): MenuItem[] => {
  const { closeMenu, onShowDataManager } = deps;
  const tab = (id: string, label: string, icon: MenuItem['icon'], target: string): MenuItem => ({
    id, label, icon, onSelect: () => { closeMenu(); onShowDataManager(target); },
  });
  return [
    tab('data-home', 'Home', 'house', 'home'),
    tab('profiles', 'Profiles', 'users', 'profiles'),
    tab('roms', 'ROMs', 'gamepad-2', 'roms'),
    tab('languages', 'Language Studio', 'globe', 'languages'),
    tab('msu', 'MSU Studio', 'headphones', 'msu'),
    tab('sprites', 'Sprites', 'image', 'sprites'),
    tab('player-sprites', 'Character Studio', 'user', 'linkSprites'),
  ];
};

const buildAdvancedItems = (deps: MenuBuilderDeps): MenuItem[] => {
  const {
    closeMenu, win, onShowInputTester, onShowHudLayout, onShowDataInspector, onShowSpriteDebug, onShowShadowEditor,
    developerToolsEnabled = false,
  } = deps;
  const item = (id: string, label: string, icon: MenuItem['icon'], run: () => void): MenuItem => ({
    id, label, icon, onSelect: () => { closeMenu(); run(); },
  });
  return [
    item('input-tester', 'Input Calibration', 'gamepad-2', onShowInputTester),
    item('hud-layout', 'HUD Layout Editor', 'layout-list', onShowHudLayout),
    item('data-inspector', 'Data Inspector', 'search', onShowDataInspector),
    ...(developerToolsEnabled ? [
      item('dev-console', 'Dev Console', 'braces', () => win.openDevTools()),
      item('sprite-debug', 'Sprite Debug', 'image', onShowSpriteDebug),
      item('shadow-editor', 'Shadow Editor', 'moon', onShowShadowEditor),
    ] : []),
  ];
};

const buildTitleBarMenuItems = (deps: MenuBuilderDeps): MenuGroup[] => {
  const { closeMenu, win, activeProfile, gameRunning, onShowProfile, onToggleSaveStates, onShowRandomizer } = deps;
  const { onCheckForUpdates, onShowCredits, onShowAbout } = deps;
  const run = (fn: () => void) => () => { closeMenu(); fn(); };
  return [
    {
      id: 'play',
      items: [
        { id: 'home', label: 'Home', icon: 'house', disabled: !activeProfile, onSelect: run(onShowProfile) },
        { id: 'save-states', label: 'Save States', icon: 'save', disabled: !gameRunning, onSelect: run(onToggleSaveStates) },
        { id: 'randomizer', label: 'Randomizer', icon: 'sparkles', onSelect: run(onShowRandomizer) },
      ],
    },
    {
      id: 'tools',
      items: [
        { id: 'data', label: 'Data', icon: 'archive', children: buildDataItems(deps) },
        { id: 'widgets', label: 'Widgets', icon: 'layout-grid', children: buildWidgetItems(deps) },
        { id: 'advanced', label: 'Advanced', icon: 'settings', children: buildAdvancedItems(deps) },
      ],
    },
    {
      id: 'app',
      items: [
        ...(onCheckForUpdates ? [{ id: 'check-updates', label: 'Check for Updates', icon: 'refresh-cw' as const, onSelect: run(onCheckForUpdates) }] : []),
        { id: 'credits', label: 'Credits', icon: 'trophy', onSelect: run(onShowCredits) },
        { id: 'about', label: 'About', icon: 'info', onSelect: run(onShowAbout) },
        { id: 'quit', label: 'Quit', icon: 'log-out', onSelect: () => win.close() },
      ],
    },
  ];
};

export { buildTitleBarMenuItems };
