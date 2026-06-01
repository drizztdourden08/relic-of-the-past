import { useState, useCallback, useEffect } from 'react';
import { TitleBar } from '../components/views/TitleBar';
import { GameLayer } from '../components/views/GameLayer';
import { SaveStateOverlay } from '../components/views/SaveStateOverlay/SaveStateOverlay';
import { WidgetManager, useWidgetLayout } from '../components/composites/Widget';
import { InventoryWidgetContent, InventoryWidgetSettings, ChecksWidgetContent, LogsWidgetContent, DebugWidgetContent, NavigationWidgetContent, DatasetWidgetContent, CheatsWidgetContent } from '../widgets';
import { SpriteDebug } from '../components/views/SpriteDebug';
import { useShadowEditorStore } from '../stores/shadow-editor-store';
import { Dialog } from '../components/composites/Dialog';
import { PageRouter } from './PageRouter';
import type { ProfileHubTab } from '../components/views/ProfileHub/types';
import { useAppNavigation } from './behavior/useAppNavigation';
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
import { useDumpLayers } from './behavior/useDumpLayers';
import { useDumpNav } from './behavior/useDumpNav';
import { getInputManager, primeLiveSettings } from '../lib/game';
import './App.css';

const App = () => {
  const [dataTab, setDataTab] = useState<string>('profiles');
  const [profileHubTab, setProfileHubTab] = useState<ProfileHubTab>('home');

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
  const [showSpriteDebug, setShowSpriteDebug] = useState(false);
  const toggleSpriteDebug = useCallback(() => setShowSpriteDebug(v => !v), []);
  const [shadowEditorWarningShown, setShadowEditorWarningShown] = useState(
    () => localStorage.getItem('shadowEditor.warningDismissed') === 'true',
  );
  const handleShowShadowEditor = useCallback(() => {
    if (!shadowEditorWarningShown) {
      showDialog({
        title: 'Shadow Editor — Developer Tool',
        message: 'This tool modifies shadow casting data that is committed directly to the project source code. Any changes you make here will affect the game\'s lighting for ALL builds.\n\nThis tool is only available in development mode.',
        confirmLabel: 'I understand, open editor',
        variant: 'default',
        onConfirm: () => {
          dismissDialog();
          localStorage.setItem('shadowEditor.warningDismissed', 'true');
          setShadowEditorWarningShown(true);
          useShadowEditorStore.getState().setOpen(true);
        },
      });
    } else {
      useShadowEditorStore.getState().setOpen(true);
    }
  }, [shadowEditorWarningShown, showDialog, dismissDialog]);
  useKeyboardShortcuts(nav, dialog, dismissDialog, profileMgmt.activeProfile);

  // Dev-only sprite debug toggle (Ctrl+Shift+D)
  useEffect(() => {
    if (!window.api.isDev) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); setShowSpriteDebug(v => !v); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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

  // ─── Navigation with game-running confirmation ───
  const handleShowPicker = useCallback(async () => {
    if (game.isRunning) {
      showDialog({
        title: 'Switch Profile',
        message: 'This will close the currently running game. Any unsaved progress will be lost.',
        confirmLabel: 'Switch Profile',
        variant: 'default',
        onConfirm: async () => {
          dismissDialog();
          game.clearGame();
          profileMgmt.setActiveProfile(null);
          await nav.handleShowPicker();
        },
      });
    } else {
      await nav.handleShowPicker();
    }
  }, [game, showDialog, dismissDialog, profileMgmt, nav]);

  const handleShowProfile = useCallback(async () => {
    if (profileMgmt.activeProfile) {
      await profileMgmt.refreshProfilesAndRoms();
      nav.setActivePage('profile');
    }
  }, [profileMgmt, nav]);

  const handleShowDataManager = useCallback(async (tab?: string) => {
    if (tab) setDataTab(tab);
    await profileMgmt.refreshProfilesAndRoms();
    nav.setActivePage('data');
  }, [profileMgmt, nav]);

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
        activeProfile={profileMgmt.activeProfile}
        gameRunning={game.isRunning}
        windowMode={display.windowMode}
        isMuted={audio.isMuted}
        onToggleMute={audio.handleToggleMute}
        showFps={display.showFps}
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
    </div>
  );
};

export { App };
