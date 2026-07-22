/* @layer renderer-app @kind component */
import { useEffect, useMemo } from 'react';
import { Box, Image } from '@ds/primitives';
import { WidgetManager, useWidgetLayout } from '@ds/composites/Widget';
import { Dialog } from '@ds/composites/Dialog';
import { InventoryWidgetContent, InventoryWidgetSettings, ChecksWidgetContent, LogsWidgetContent, DebugWidgetContent, NavigationWidgetContent, DatasetWidgetContent, CheatsWidgetContent, SimulatorWidgetContent } from '@domains/widgets';
import { loadTrackerStateBlob, saveTrackerStateBlob } from '@app/lib/tracker-state-io';
import { primeLiveSettings } from '@app/lib/game';
import { useExclusiveInsetsStore } from '@app/stores/exclusive-insets-store';
import { applyNotchMode } from '@app/hooks/useSafeAreaInsets';
import { useAutoUpdate } from '@app/hooks/useAutoUpdate';
import { PageRouter } from '@app/App/PageRouter';
import { useAppNavigation } from '@app/App/behavior/useAppNavigation';
import { useAppOverlays } from '@app/App/behavior/useAppOverlays';
import { useAppViewCallbacks } from '@app/App/behavior/useAppViewCallbacks';
import { useAudioSettings } from '@app/App/behavior/useAudioSettings';
import { useConfirmDialog } from '@app/App/behavior/useConfirmDialog';
import { useDisplaySettings } from '@app/App/behavior/useDisplaySettings';
import { useGameLifecycle } from '@app/App/behavior/useGameLifecycle';
import { useIpcLogBridge } from '@app/App/behavior/useIpcLogBridge';
import { useKeyboardShortcuts } from '@app/App/behavior/useKeyboardShortcuts';
import { useProfileManagement } from '@app/App/behavior/useProfileManagement';
import { useSaveOverlay } from '@app/App/behavior/useSaveOverlay';
import { useSaveStateSettings } from '@app/App/behavior/useSaveStateSettings';
import { useStartup } from '@app/App/behavior/useStartup';
import { useAutoTest } from '@app/App/behavior/useAutoTest';
import { useDumpLayers } from '@app/App/behavior/useDumpLayers';
import { useDumpNav } from '@app/App/behavior/useDumpNav';
import { useSimRun } from '@app/App/behavior/useSimRun';
import { useAppMainEffects } from '@app/App/behavior/useAppMainEffects';
import { useCapability } from '@app/platform';
import { TitleBar } from '../TitleBar';
import { MobileChrome } from '../MobileChrome';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';
import { GameLayer } from '../GameLayer';
import { SaveStateOverlay } from '../SaveStateOverlay/SaveStateOverlay';
import { UpdateDialog } from '../../compounds/UpdateDialog';
import './AppMain.css';

// Profile-layout persistence injected into the bare Widget composite (keeps IPC out of it).
const widgetIO = { load: loadTrackerStateBlob, save: saveTrackerStateBlob };

const AppMain = () => {
  const windowChrome = useCapability('windowChrome');
  const canUpdate = useCapability('selfUpdate');

  const { dialog, showDialog, dismissDialog, handleDeleteConfirm } = useConfirmDialog();
  const game = useGameLifecycle();
  const audio = useAudioSettings();
  const saveState = useSaveStateSettings();
  const display = useDisplaySettings({ isGameRunning: game.isRunning });
  const profileMgmt = useProfileManagement({
    showDialog,
    dismissDialog,
    onProfileLoaded: (data) => {
      primeLiveSettings(data.settings);
      applyNotchMode(data.settings.renderIntoNotch);
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
  const widgets = useWidgetLayout(profileMgmt.activeProfile?.id ?? null, widgetIO);
  const setExclusiveInsets = useExclusiveInsetsStore((s) => s.setInsets);
  const saveOverlay = useSaveOverlay(saveState, game.isRunning);
  const update = useAutoUpdate();

  const {
    showUpdateDialog, setShowUpdateDialog,
    handleShowShadowEditor,
  } = useAppOverlays({ showDialog, dismissDialog });

  const {
    dataTab, profileHubTab, setProfileHubTab,
    handleShowProfile, handleShowDataManager,
  } = useAppViewCallbacks({ game, showDialog, dismissDialog, profileMgmt, nav });

  useKeyboardShortcuts(nav, dialog, dismissDialog, profileMgmt.activeProfile);

  useStartup(profileMgmt, nav);
  useAutoTest({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame });
  useDumpLayers({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame, openNavWidget: () => widgets.open('navigation') });
  useDumpNav({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame });
  useSimRun({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame });
  useIpcLogBridge();
  useAppMainEffects({ isGameRunning: game.isRunning, activePage: nav.activePage, openNavWidget: () => widgets.open('navigation') });

  // Default notch mode until a profile loads (keeps startup windows clear of a cutout).
  useEffect(() => { applyNotchMode(true); }, []);

  const widgetVisibility = useMemo(() => Object.fromEntries(widgets.layout.widgets.map((w) => [w.id, w.visible])), [widgets.layout]);

  // Shared by the desktop TitleBar and the touch MobileChrome — same actions, two views.
  const chromeProps: TitleBarProps = {
    onImportRom: profileMgmt.handleImportRom,
    onSwitchProfile: () => handleShowDataManager('profiles'),
    onShowProfile: handleShowProfile,
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
    onShowConnectionDebug: () => widgets.toggle('navigation'),
    onToggleDataset: () => widgets.toggle('dataset'),
    onToggleSimulator: () => widgets.toggle('simulator'),
    onShowShadowEditor: handleShowShadowEditor,
    onShowAbout: () => nav.setActivePage('about'),
    activeProfile: profileMgmt.activeProfile,
    widgetVisibility,
    gameRunning: game.isRunning,
    windowMode: display.windowMode,
    isMuted: audio.isMuted,
    onToggleMute: audio.handleToggleMute,
    showFps: display.showFps,
    updateAvailable: canUpdate && !update.portable && (update.status === 'available' || update.status === 'ready'),
    onUpdateClick: () => setShowUpdateDialog(true),
    onCheckForUpdates: !canUpdate || update.portable ? undefined : () => { update.check(); setShowUpdateDialog(true); },
  };

  return (
    <Box className="app">
      {windowChrome
        ? <TitleBar {...chromeProps} />
        : <MobileChrome {...chromeProps} activePage={nav.activePage} onClosePage={() => nav.setActivePage('none')} />}

      <Box className="app__content">
        {!game.isRunning && (
          <Image className="app__bg-logo" src="./logos/logo-512.png" alt="" />
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
          dataTab={dataTab}
          profileHubTab={profileHubTab}
          onProfileHubTabChange={setProfileHubTab}
        />

        <WidgetManager
          layout={widgets.layout}
          gameRunning={game.isRunning && nav.activePage === 'none'}
          onUpdate={widgets.update}
          onClose={widgets.close}
          onInsetsChange={setExclusiveInsets}
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
            simulator: <SimulatorWidgetContent />,
          }}
        </WidgetManager>

      </Box>

      <Dialog
        open={dialog != null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel={dialog?.confirmLabel}
        variant={dialog?.variant}
        onConfirm={dialog?.onConfirm ?? (() => {})}
        onCancel={dismissDialog}
      />

      {canUpdate && (
      <UpdateDialog
        open={showUpdateDialog}
        state={update}
        onDownload={update.download}
        onInstall={update.install}
        onClose={() => setShowUpdateDialog(false)}
      />
      )}
    </Box>
  );
};

export { AppMain };
