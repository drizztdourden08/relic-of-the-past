/* @layer renderer-appshell @kind logic */
/**
 * Builds the prop bag shared by the desktop TitleBar and the touch MobileChrome. Same actions,
 * two views. Pure wiring, extracted from AppMain so that component stays about composition.
 */
import type { TitleBarProps } from '../../ui/domains/app/views/TitleBar/TitleBar.type';
import type { ProfileHubTab } from '../../ui/domains/app/views/ProfileHub/ProfileHub.type';
import type { PageId } from '../types';

interface ChromePropsDeps {
  profileMgmt: { handleImportRom: () => void; activeProfile: TitleBarProps['activeProfile'] };
  widgets: { toggle: (id: string) => void };
  saveOverlay: { toggle: () => void };
  nav: { setActivePage: (page: PageId) => void };
  game: { isRunning: boolean };
  display: { windowMode: TitleBarProps['windowMode']; showFps: boolean };
  audio: { isMuted: boolean; handleToggleMute: () => void };
  widgetVisibility: Record<string, boolean>;
  developerToolsEnabled: boolean;
  handleShowProfile: (tab?: ProfileHubTab) => void | Promise<void>;
  handleShowDataManager: (tab?: string) => void | Promise<void>;
  handleShowShadowEditor: () => void;
  canUpdate: boolean;
  update: { supported: boolean; status: string; check: () => void };
  setShowUpdateDialog: (open: boolean) => void;
  setShowBugReportDialog: (open: boolean) => void;
}

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
    // Deep-links the Display tab, so the incompatible-refresh-rate tag lands on the setting
    // that explains it instead of the hub's front page.
    onShowDisplaySettings: () => { void handleShowProfile('settings'); },
    onShowLogs: () => widgets.toggle('logs'),
    onToggleSaveStates: saveOverlay.toggle,
    onToggleInventory: () => widgets.toggle('inventory'),
    onToggleChecks: () => widgets.toggle('checks'),
    onToggleDebug: () => widgets.toggle('debug'),
    onToggleCheats: () => widgets.toggle('cheats'),
    onShowDataManager: handleShowDataManager,
    onShowInputTester: () => nav.setActivePage('input-tester'),
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
