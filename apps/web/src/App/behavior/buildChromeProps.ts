/* @layer renderer-appshell @kind logic */
import type { TitleBarProps } from '../../ui/domains/app/views/TitleBar/TitleBar.type';
import type { ChromePropsDeps } from './build-chrome-props.type';

const buildChromeProps = (deps: ChromePropsDeps): TitleBarProps => {
  const {
    profileMgmt, widgets, saveOverlay, nav, game, display, audio, widgetVisibility, developerToolsEnabled,
    handleShowProfile, handleShowDataManager, handleShowShadowEditor,
    canUpdate, update, setShowUpdateDialog, setShowBugReportDialog,
  } = deps;

  return {
    onImportRom: profileMgmt.handleImportRom,
    onSwitchProfile: () => { void handleShowDataManager('profiles'); },
    onShowProfile: () => { void handleShowProfile(); },
    onShowDisplaySettings: () => { void handleShowProfile('settings'); },
    onShowLogs: () => widgets.toggle('logs'),
    onToggleSaveStates: saveOverlay.toggle,
    onToggleInventory: () => widgets.toggle('inventory'),
    onToggleChecks: () => widgets.toggle('checks'),
    onToggleDebug: () => widgets.toggle('debug'),
    onToggleCheats: () => widgets.toggle('cheats'),
    onShowDataManager: handleShowDataManager,
    onShowInputTester: () => nav.setActivePage('input-tester'),
    onShowHudLayout: () => nav.setActivePage('hud-layout'),
    onShowCredits: () => nav.setActivePage('credits'),
    onShowDesignGallery: () => nav.setActivePage('design-gallery'),
    onShowSpriteDebug: () => nav.setActivePage('sprite-debug'),
    onShowDataInspector: () => nav.setActivePage('data-inspector'),
    onShowConnectionDebug: () => widgets.toggle('navigation'),
    onToggleDataset: () => widgets.toggle('dataset'),
    onToggleSimulator: () => widgets.toggle('simulator'),
    onToggleMusic: () => widgets.toggle('music'),
    onShowShadowEditor: handleShowShadowEditor,
    onShowAbout: () => nav.setActivePage('about'),
    onShowRandomizer: () => nav.setActivePage('randomizer'),
    onShowBugReport: () => setShowBugReportDialog(true),
    activeProfile: profileMgmt.activeProfile,
    widgetVisibility,
    developerToolsEnabled,
    gameRunning: game.isRunning,
    windowMode: display.windowMode,
    isMuted: audio.isMuted,
    onToggleMute: audio.handleToggleMute,
    showFps: display.showFps,
    updateAvailable: canUpdate && update.supported && update.status === 'available',
    onUpdateClick: () => setShowUpdateDialog(true),
    onCheckForUpdates: !canUpdate || !update.supported
      ? undefined
      : () => { update.check(); setShowUpdateDialog(true); },
  };
};

export { buildChromeProps };
export type { ChromePropsDeps };
