/* @layer renderer-app @kind component */
import { useEffect, useMemo } from 'react';
import { Box, Image } from '@ds/primitives';
import { WidgetManager, useWidgetLayout } from '@ds/composites/Widget';
import { Dialog } from '@ds/composites/Dialog';
import { InventoryWidgetContent, InventoryWidgetSettings, ChecksWidgetContent, LogsWidgetContent, DebugWidgetContent, NavigationWidgetContent, LiveDataInspectorContent, CheatsWidgetContent, SimulatorWidgetContent, MusicWidgetContent } from '@domains/widgets';
import { loadTrackerStateBlob, saveTrackerStateBlob } from '@app/lib/tracker-state-io';
import { primeLiveSettings } from '@app/lib/game';
import { useExclusiveInsetsStore } from '@app/stores/exclusive-insets-store';
import { useDevToolsWidgetGate } from '@app/App/behavior/useDevToolsWidgetGate';
import { useWidgetDisabledGate } from '@app/App/behavior/useWidgetDisabledGate';
import { applyNotchMode } from '@app/hooks/useSafeAreaInsets';
import { useAutoUpdate } from '@app/hooks/useAutoUpdate';
import { PageRouter } from '@app/App/PageRouter';
import { useAppNavigation } from '@app/App/behavior/useAppNavigation';
import { useAppOverlays } from '@app/App/behavior/useAppOverlays';
import { useAppViewCallbacks } from '@app/App/behavior/useAppViewCallbacks';
import { buildChromeProps } from '@app/App/behavior/buildChromeProps';
import { useAudioSettings } from '@app/App/behavior/useAudioSettings';
import { useConfirmDialog } from '@app/App/behavior/useConfirmDialog';
import { useDisplaySettings } from '@app/App/behavior/useDisplaySettings';
import { useGameLifecycle } from '@app/App/behavior/useGameLifecycle';
import { useIpcLogBridge } from '@app/App/behavior/useIpcLogBridge';
import { useMsulOpen } from '@app/App/behavior/useMsulOpen';
import { useKeyboardShortcuts } from '@app/App/behavior/useKeyboardShortcuts';
import { useProfileManagement } from '@app/App/behavior/useProfileManagement';
import { useSaveOverlay } from '@app/App/behavior/useSaveOverlay';
import { useSaveStateSettings } from '@app/App/behavior/useSaveStateSettings';
import { useStartup } from '@app/App/behavior/useStartup';
import { useShellReady } from '@app/App/behavior/useShellReady';
import { useWasmWarmup } from '@app/App/behavior/useWasmWarmup';
import { useDebugLaunchHooks } from '@app/App/behavior/useDebugLaunchHooks';
import { useRandomizerBoot } from '@app/App/behavior/useRandomizerBoot';
import { useAppMainEffects } from '@app/App/behavior/useAppMainEffects';
import { useCapability } from '@app/platform';
import { TitleBar } from '../TitleBar';
import { MobileChrome } from '../MobileChrome';
import { SearchPalette } from '../SearchPalette';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';
import { GameLayer } from '../GameLayer';
import { BootProgressBar } from '../BootProgressBar';
import { SaveStateOverlay } from '../SaveStateOverlay/SaveStateOverlay';
import { UpdateDialog } from '../../compounds/UpdateDialog';
import { BugReportDialog } from '../BugReport';
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
        pixelPerfect: data.settings.pixelPerfect,
      });
      audio.initFromSettings(data.settings.masterVolume);
      saveState.initFromSettings(data.settings.enhancedSaveSlotShortcut, data.settings.saveHoldDuration);
    },
    onGameClear: () => game.clearGame(),
  });
  const nav = useAppNavigation({ activeProfile: profileMgmt.activeProfile, refreshLists: profileMgmt.refreshProfilesAndRoms });
  const widgets = useWidgetLayout(profileMgmt.activeProfile?.id ?? null, widgetIO, window.api.startup);
  // Master gate for developer-only UI (widgets, dev pages, shadow editor); also closes
  // devOnly widgets the moment it flips off.
  const developerToolsEnabled = useDevToolsWidgetGate(widgets.layout, widgets.close, window.api.startup.widgets);
  // Vanilla Safe + per-widget requiresSetting gates: covers affected widgets with an overlay
  // instead of hiding them.
  const { vanillaSafe, settings: liveSettings, onOpenSettings: onOpenWidgetSettings } = useWidgetDisabledGate(nav.setActivePage);
  const setExclusiveInsets = useExclusiveInsetsStore((s) => s.setInsets);
  const saveOverlay = useSaveOverlay(saveState, game.isRunning);
  const update = useAutoUpdate();

  const {
    showUpdateDialog, setShowUpdateDialog,
    showBugReportDialog, setShowBugReportDialog,
    handleShowShadowEditor,
  } = useAppOverlays({ showDialog, dismissDialog });

  const { dataTab, profileHubTab, setProfileHubTab, handleShowProfile, handleShowDataManager } =
    useAppViewCallbacks({ game, showDialog, dismissDialog, profileMgmt, nav });

  useKeyboardShortcuts(nav, dialog, dismissDialog, profileMgmt.activeProfile, developerToolsEnabled);

  const startup = useStartup(profileMgmt, nav);
  useWasmWarmup();
  useDebugLaunchHooks({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame, openNavWidget: () => widgets.open('navigation') });
  useRandomizerBoot(profileMgmt.activeProfile?.id ?? null);
  useIpcLogBridge();
  // A music pack opened from the desktop imports itself.
  useMsulOpen();
  useAppMainEffects({ isGameRunning: game.isRunning, activePage: nav.activePage, openNavWidget: () => widgets.open('navigation') });

  // Splash window → main window: reveal only once startup has settled and painted,
  // so the first frame the user sees is the finished shell (electron only).
  useShellReady(startup.settled);

  const widgetVisibility = useMemo(() => Object.fromEntries(widgets.layout.widgets.map((w) => [w.id, w.visible])), [widgets.layout]);

  const chromeProps: TitleBarProps = buildChromeProps({
    profileMgmt, widgets, saveOverlay, nav, game, display, audio, widgetVisibility, developerToolsEnabled,
    handleShowProfile, handleShowDataManager, handleShowShadowEditor,
    canUpdate, update, setShowUpdateDialog, setShowBugReportDialog,
  });

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
          pixelPerfect={display.pixelPerfect}
          shadowCasting={display.postProcessingShadows}
          developerToolsEnabled={developerToolsEnabled}
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
          developerToolsEnabled={developerToolsEnabled}
          startupForcedWidgetIds={window.api.startup.widgets}
          vanillaSafe={vanillaSafe}
          settings={liveSettings}
          onOpenSettings={onOpenWidgetSettings}
        >
          {{
            inventory: <InventoryWidgetContent />,
            checks: <ChecksWidgetContent />,
            logs: <LogsWidgetContent />,
            debug: <DebugWidgetContent />,
            navigation: <NavigationWidgetContent />,
            dataset: <LiveDataInspectorContent />,
            cheats: <CheatsWidgetContent />,
            simulator: <SimulatorWidgetContent />,
            music: <MusicWidgetContent />,
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
        canInstall={update.canInstall}
        onApply={update.apply}
        onOpenReleasePage={update.openReleasePage}
        onLoadVersions={update.loadVersions}
        onSetPrefs={update.setPrefs}
        onReportBug={() => { setShowUpdateDialog(false); setShowBugReportDialog(true); }}
        onClose={() => setShowUpdateDialog(false)}
      />
      )}
      <BugReportDialog
        open={showBugReportDialog}
        onClose={() => setShowBugReportDialog(false)}
      />

      <BootProgressBar />

      <SearchPalette navProps={chromeProps} navDeps={{ setActivePage: nav.setActivePage, setProfileHubTab }} />
    </Box>
  );
};

export { AppMain };
