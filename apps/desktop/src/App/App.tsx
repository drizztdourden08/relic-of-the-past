import { useState, useCallback, useEffect } from 'react';
import { TitleBar } from '../components/views/TitleBar';
import { GameLayer } from '../components/views/GameLayer';
import { SaveStateOverlay } from '../components/views/SaveStateOverlay/SaveStateOverlay';
import { WidgetManager, useWidgetLayout } from '../components/composites/Widget';
import { InventoryWidgetContent, InventoryWidgetSettings, ChecksWidgetContent, LogsWidgetContent } from '../widgets';
import { SpriteDebug } from '../components/views/SpriteDebug';
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
import { getInputManager } from '../lib/game';
import './App.css';

export const App = () => {
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
      game.setGameData(data.assetData, data.configIni);
      display.initFromSettings({
        windowMode: data.settings.windowMode,
        viewportConstraint: data.settings.viewportConstraint,
        aspectRatio: data.settings.aspectRatio,
        displayPerfInTitle: data.settings.displayPerfInTitle,
        overworldEdgeEffect: data.settings.overworldEdgeEffect,
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
  useKeyboardShortcuts(nav, dialog, dismissDialog, profileMgmt.activeProfile, showSpriteDebug, setShowSpriteDebug);

  useStartup(profileMgmt, nav);
  useIpcLogBridge();

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
        onShowDataManager={handleShowDataManager}
        onShowInputTester={() => nav.setActivePage('input-tester')}
        onShowCredits={() => nav.setActivePage('credits')}
        onShowSpriteDebug={toggleSpriteDebug}
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
          }}
        </WidgetManager>

        {showSpriteDebug && <SpriteDebug onClose={toggleSpriteDebug} />}
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
