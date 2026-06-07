/* @layer renderer-appshell @kind component */
import { useEffect } from 'react';
import { TitleBar } from '../components/views/TitleBar';
import { GameLayer } from '../components/views/GameLayer';
import { SaveStateOverlay } from '../components/views/SaveStateOverlay/SaveStateOverlay';
import { WidgetManager, useWidgetLayout } from '../components/composites/Widget';
import { InventoryWidgetContent, InventoryWidgetSettings, ChecksWidgetContent, LogsWidgetContent, DebugWidgetContent, NavigationWidgetContent, DatasetWidgetContent, CheatsWidgetContent } from '../widgets';
import { SpriteDebug } from '../components/views/SpriteDebug';
import { Dialog } from '../components/composites/Dialog';
import { UpdateDialog } from '../components/composites/UpdateDialog';
import { AboutDialog } from '../components/composites/AboutDialog';
import { PageRouter } from './PageRouter';
import { useAppNavigation } from './behavior/useAppNavigation';
import { useAppOverlays } from './behavior/useAppOverlays';
import { useAppViewCallbacks } from './behavior/useAppViewCallbacks';
import { useAudioSettings } from './behavior/useAudioSettings';
import { useConfirmDialog } from './behavior/useConfirmDialog';
import { useDisplaySettings } from './behavior/useDisplaySettings';
import { useGameLifecycle } from './behavior/useGameLifecycle';
import { useIpcLogBridge } from './behavior/useIpcLogBridge';
import { useKeyboardShortcuts } from './behavior/useKeyboardShortcuts';
import { useProfileManagement } from './behavior/useProfileManagement';
import { useSaveOverlay } from './behavior/useSaveOverlay';
import { useSaveStateSettings } from './behavior/useSaveStateSettings';
import { useStartup } from './behavior/useStartup';
import { useAutoTest } from './behavior/useAutoTest';
import { useAutoUpdate } from '../hooks/useAutoUpdate';
import { useAppVersion } from '../hooks/useAppVersion';
import { useDumpLayers } from './behavior/useDumpLayers';
import { useDumpNav } from './behavior/useDumpNav';
import { getInputManager, primeLiveSettings } from '../lib/game';
import './App.css';

const App = () => {
  const appVersion = useAppVersion();

  const { dialog, showDialog, dismissDialog, handleDeleteConfirm } = useConfirmDialog();
  const game = useGameLifecycle();
  const audio = useAudioSettings();
  const saveState = useSaveStateSettings();
  const display = useDisplaySettings({ isGameRunning: game.isRunning });
  const profileMgmt = useProfileManagement({
    refreshLists: async () => { await profileMgmt.refreshProfilesAndRoms(); },
    showDialog,
    dismissDialog,
    onProfileLoaded: (data) => {
      primeLiveSettings(data.settings);
      game.setGameData(data.assetData, data.configIni);
      display.initFromSettings({
        windowMode: data.settings.windowMode,
        viewportConstraint: data.settings.viewportConstraint,
        aspectRatio: data.settings.aspectRatio,
        displayPerfInTitle: data.settings.displayPerfInTitle,
        overworldEdgeEffect: data.settings.overworldEdgeEffect,
        postProcessingShadows: data.settings.postProcessingShadows,
        startFullscreen: data.settings.startFullscreen,
      });
      audio.initFromSettings(data.settings.masterVolume);
      saveState.initFromSettings(data.settings.enhancedSaveSlotShortcut, data.settings.saveHoldDuration);
    },
    onGameClear: () => game.clearGame(),
  });
  const nav = useAppNavigation({ activeProfile: profileMgmt.activeProfile, refreshLists: profileMgmt.refreshProfilesAndRoms });
  const widgets = useWidgetLayout(profileMgmt.activeProfile?.id ?? null);
  const saveOverlay = useSaveOverlay(saveState, game.isRunning);
  const update = useAutoUpdate();

  const {
    showUpdateDialog, setShowUpdateDialog,
    showAbout, setShowAbout,
    showSpriteDebug, toggleSpriteDebug,
    handleShowShadowEditor,
  } = useAppOverlays({ showDialog, dismissDialog });

  const {
    dataTab, profileHubTab, setProfileHubTab,
    handleShowPicker, handleShowProfile, handleShowDataManager,
  } = useAppViewCallbacks({ game, showDialog, dismissDialog, profileMgmt, nav });

  useKeyboardShortcuts(nav, dialog, dismissDialog, profileMgmt.activeProfile);

  useStartup(profileMgmt, nav);
  useAutoTest({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame });
  useDumpLayers({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame, openNavWidget: () => widgets.open('navigation') });
  useDumpNav({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame });
  useIpcLogBridge();

  // Auto-open navigation widget when --auto-flood CLI flag is set
  useEffect(() => {
    if (window.api.autoFlood) widgets.open('navigation');
  }, []);

  // Input suppression: disable game input when menus/overlays are open
  useEffect(() => {
    const gameActive = game.isRunning && nav.activePage === 'none' && !showSpriteDebug;
    getInputManager().setInputSuppressed(!gameActive);
  }, [game.isRunning, nav.activePage, showSpriteDebug]);

  return (
    <div className="app">
      <TitleBar
        onImportRom={profileMgmt.handleImportRom}
        onSwitchProfile={handleShowPicker}
        onShowProfile={handleShowProfile}
        onShowLogs={() => widgets.toggle('logs')}
        onToggleSaveStates={saveOverlay.toggle}
        onToggleInventory={() => widgets.toggle('inventory')}
        onToggleChecks={() => widgets.toggle('checks')}
        onToggleDebug={() => widgets.toggle('debug')}
        onToggleCheats={() => widgets.toggle('cheats')}
        onShowDataManager={handleShowDataManager}
        onShowInputTester={() => nav.setActivePage('input-tester')}
        onShowCredits={() => nav.setActivePage('credits')}
        onShowSpriteDebug={toggleSpriteDebug}
        onShowConnectionDebug={() => widgets.toggle('navigation')}
        onToggleDataset={() => widgets.toggle('dataset')}
        onShowShadowEditor={handleShowShadowEditor}
        onShowAbout={() => setShowAbout(true)}
        activeProfile={profileMgmt.activeProfile}
        gameRunning={game.isRunning}
        windowMode={display.windowMode}
        isMuted={audio.isMuted}
        onToggleMute={audio.handleToggleMute}
        showFps={display.showFps}
        updateAvailable={!update.portable && (update.status === 'available' || update.status === 'ready')}
        onUpdateClick={() => setShowUpdateDialog(true)}
        onCheckForUpdates={update.portable ? undefined : () => { update.check(); setShowUpdateDialog(true); }}
      />

      <div className="app__content">
        {!game.isRunning && (
          <img className="app__bg-logo" src="./logos/logo-512.png" alt="" />
        )}

        <GameLayer
          assetData={game.assetData}
          configIni={game.configIni}
          profileId={profileMgmt.activeProfile?.id}
          stretch={display.viewportConstraint !== 'none'}
          edgeEffect={display.overworldEdgeEffect}
          shadowCasting={display.postProcessingShadows}
        />

        <SaveStateOverlay
          open={saveOverlay.open}
          onClose={saveOverlay.close}
          highlightedSlot={saveOverlay.highlightedSlot}
          holdProgress={saveOverlay.holdProgress}
          hints={saveOverlay.hints}
        />

        <PageRouter
          nav={nav}
          profileMgmt={profileMgmt}
          game={game}
          display={display}
          audio={audio}
          saveState={saveState}
          handleDeleteConfirm={handleDeleteConfirm}
          handleShowPicker={handleShowPicker}
          dataTab={dataTab}
          profileHubTab={profileHubTab}
          onProfileHubTabChange={setProfileHubTab}
        />

        <WidgetManager
          layout={widgets.layout}
          gameRunning={game.isRunning && nav.activePage === 'none' && !showSpriteDebug}
          onUpdate={widgets.update}
          onClose={widgets.close}
          settingsContent={{ inventory: <InventoryWidgetSettings /> }}
        >
          {{
            inventory: <InventoryWidgetContent />,
            checks: <ChecksWidgetContent />,
            logs: <LogsWidgetContent />,
            debug: <DebugWidgetContent />,
            navigation: <NavigationWidgetContent />,
            dataset: <DatasetWidgetContent />,
            cheats: <CheatsWidgetContent />,
          }}
        </WidgetManager>

        {showSpriteDebug && <SpriteDebug onClose={toggleSpriteDebug} romFile={profileMgmt.activeProfile?.romFile ?? ''} />}
      </div>

      <Dialog
        open={dialog != null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel={dialog?.confirmLabel}
        variant={dialog?.variant}
        onConfirm={dialog?.onConfirm ?? (() => {})}
        onCancel={dismissDialog}
      />

      <UpdateDialog
        open={showUpdateDialog}
        state={update}
        onDownload={update.download}
        onInstall={update.install}
        onClose={() => setShowUpdateDialog(false)}
      />

      <AboutDialog
        open={showAbout}
        version={appVersion}
        onClose={() => setShowAbout(false)}
      />
    </div>
  );
};

export { App };
