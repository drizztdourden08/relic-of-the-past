import { useState, useCallback, useEffect } from 'react';
import { TitleBar } from '../components/views/TitleBar';
import { GameLayer } from '../components/views/GameLayer';
import { SaveStateOverlay } from '../components/views/SaveStateOverlay/SaveStateOverlay';
import { useEnhancedSaveSlot } from '../components/views/SaveStateOverlay/useEnhancedSaveSlot';
import { ProfilePicker } from '../components/views/ProfilePicker';
import { ProfileHub } from '../components/views/ProfileHub';
import { DataManager } from '../components/views/DataManager';
import { WidgetManager, useWidgetLayout, InventoryWidgetContent, InventoryWidgetSettings, ChecksWidgetContent, LogsWidgetContent } from '../widgets';
import { InputCalibration } from '../components/views/InputTester';
import { CreditsPage } from '../components/views/ProfileHub/tabs/CreditsTab';
import { SpriteDebug } from '../components/views/SpriteDebug';
import { FullScreenLayer } from '../components/composites/FullScreenLayer';
import { Dialog } from '../components/composites/Dialog';
import { log } from '../lib/log-bus';
import type { LogChannel, LogLevel } from '../lib/log-bus';
import { subscribeGameState, resetGame, getInputManager } from '../lib/game';
import { setSpritesBase } from '@shared/game/items/sprites';
import { useAppNavigation } from './behavior/useAppNavigation';
import { useAudioSettings } from './behavior/useAudioSettings';
import { useConfirmDialog } from './behavior/useConfirmDialog';
import { useDisplaySettings } from './behavior/useDisplaySettings';
import { useProfileManagement } from './behavior/useProfileManagement';
import { useSaveStateSettings } from './behavior/useSaveStateSettings';
import type { RomDisplayInfo } from './types';
import './App.css';

export const App = () => {
  const [showSpriteDebug, setShowSpriteDebug] = useState(false);
  const [showSaveStates, setShowSaveStates] = useState(false);
  const [dataTab, setDataTab] = useState<string>('profiles');
  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [gameCrashed, setGameCrashed] = useState(false);
  const [configIni, setConfigIni] = useState<string | undefined>(undefined);

  const isGameRunning = assetData != null && !gameCrashed;

  // ─── Hooks ───
  const { dialog, showDialog, dismissDialog, handleDeleteConfirm } = useConfirmDialog();
  const audio = useAudioSettings();
  const saveState = useSaveStateSettings();

  const display = useDisplaySettings({ isGameRunning });

  const clearGame = useCallback(() => {
    setAssetData(null);
    setGameCrashed(false);
  }, []);

  const profileMgmt = useProfileManagement({
    refreshLists: async () => {
      await profileMgmt.refreshProfilesAndRoms();
    },
    showDialog,
    dismissDialog,
    onProfileLoaded: (data) => {
      setAssetData(data.assetData);
      setConfigIni(data.configIni);
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
    onGameClear: clearGame,
  });

  const nav = useAppNavigation({
    activeProfile: profileMgmt.activeProfile,
    isGameRunning,
    refreshLists: profileMgmt.refreshProfilesAndRoms,
  });

  const widgets = useWidgetLayout(profileMgmt.activeProfile?.id ?? null);

  // ─── Game lifecycle ───

  // Subscribe to game state for crash detection
  useEffect(() => {
    return subscribeGameState((state) => {
      if (state.status === 'error') {
        setGameCrashed(true);
      }
    });
  }, []);

  // Input suppression
  useEffect(() => {
    const gameActive = isGameRunning && nav.activePage === 'none' && !showSpriteDebug;
    getInputManager().setInputSuppressed(!gameActive);
  }, [nav.activePage, isGameRunning, showSpriteDebug]);

  // Bridge IPC log events
  useEffect(() => {
    return window.api.onLogEntry((entry) => {
      const channel = entry.channel as LogChannel;
      const level = entry.level as LogLevel;
      if (channel in log && typeof log[channel] === 'function') {
        log[channel](entry.message, level);
      }
    });
  }, []);

  // ─── Game actions ───
  const handleStartGame = useCallback(() => {
    if (profileMgmt.activeProfile) {
      profileMgmt.loadProfileForGame(profileMgmt.activeProfile);
    }
  }, [profileMgmt.activeProfile, profileMgmt.loadProfileForGame]);

  const handleStopGame = useCallback(() => {
    resetGame();
    clearGame();
  }, [clearGame]);

  const handleResetGame = useCallback(() => {
    if (profileMgmt.activeProfile) {
      resetGame();
      clearGame();
      profileMgmt.loadProfileForGame(profileMgmt.activeProfile);
    }
  }, [profileMgmt.activeProfile, profileMgmt.loadProfileForGame, clearGame]);

  // ─── Enhanced save slot shortcut flow ───
  const enhancedSave = useEnhancedSaveSlot(saveState.enhancedSaveSlot, saveState.saveHoldDuration, isGameRunning);
  const saveOverlayOpen = (showSaveStates && isGameRunning) || enhancedSave.open;
  const handleSaveOverlayClose = useCallback(() => {
    setShowSaveStates(false);
    enhancedSave.close();
  }, [enhancedSave]);

  // ─── ESC key handler ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        window.api.toggleFullscreen();
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D' && window.api.isDev) {
        e.preventDefault();
        setShowSpriteDebug(v => !v);
        return;
      }
      if (e.key !== 'Escape') return;
      if (dialog) { e.preventDefault(); dismissDialog(); return; }
      if (nav.activePage === 'picker' && profileMgmt.activeProfile) { e.preventDefault(); nav.setActivePage('none'); return; }
      if (nav.activePage === 'data') { e.preventDefault(); nav.setActivePage(profileMgmt.activeProfile ? 'none' : 'picker'); return; }
      if (nav.activePage === 'profile') { e.preventDefault(); nav.setActivePage('none'); return; }
      if (nav.activePage === 'none' && profileMgmt.activeProfile) { e.preventDefault(); nav.setActivePage('profile'); return; }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [nav.activePage, profileMgmt.activeProfile, dialog, dismissDialog, nav]);

  // ─── Switch to picker (with confirmation if game is running) ───
  const handleShowPicker = useCallback(async () => {
    if (isGameRunning) {
      showDialog({
        title: 'Switch Profile',
        message: 'This will close the currently running game. Any unsaved progress will be lost.',
        confirmLabel: 'Switch Profile',
        variant: 'default',
        onConfirm: async () => {
          dismissDialog();
          clearGame();
          profileMgmt.setActiveProfile(null);
          await profileMgmt.refreshProfilesAndRoms();
          nav.setActivePage('picker');
        },
      });
    } else {
      await profileMgmt.refreshProfilesAndRoms();
      nav.setActivePage('picker');
    }
  }, [isGameRunning, showDialog, dismissDialog, clearGame, profileMgmt, nav]);

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

  // ─── Startup: check profiles and auto-load ───
  useEffect(() => {
    (async () => {
      try {
        const [profileList, romStatusList, appState] = await Promise.all([
          window.api.listProfiles(),
          window.api.listRomsWithStatus(),
          window.api.getAppState(),
        ]);

        profileMgmt.setProfiles(profileList);
        profileMgmt.setRomStatuses(romStatusList);

        if (profileList.length === 0) {
          log.app('No profiles found, showing setup screen');
          nav.setActivePage('picker');
        } else if (profileList.length === 1) {
          log.app('Single profile found, showing profile page...');
          profileMgmt.setActiveProfile(profileList[0]);
          setSpritesBase(window.api.getSpritesBaseUrl(profileList[0].romFile));
          nav.setActivePage('profile');
        } else {
          const lastProfile = appState.lastProfileId
            ? profileList.find((p) => p.id === appState.lastProfileId)
            : null;
          if (lastProfile) {
            log.app(`Resuming last profile: ${lastProfile.name}`);
            profileMgmt.setActiveProfile(lastProfile);
            setSpritesBase(window.api.getSpritesBaseUrl(lastProfile.romFile));
            nav.setActivePage('profile');
          } else {
            nav.setActivePage('picker');
          }
        }
      } catch (err) {
        log.error(`Startup failed: ${err}`);
        nav.setActivePage('picker');
      }
    })();
  }, []);

  // ─── Derived state ───
  const romDisplayInfos: RomDisplayInfo[] = profileMgmt.romStatuses.map((rom) => ({
    ...rom,
    extractionStatus: profileMgmt.extractionStates[rom.romFile] ?? (rom.hasAssets ? 'ready' : 'idle'),
  }));

  // ─── Render ───
  return (
    <div className="app">
      <TitleBar
        onImportRom={profileMgmt.handleImportRom}
        onSwitchProfile={handleShowPicker}
        onShowProfile={handleShowProfile}
        onShowLogs={() => widgets.toggle('logs')}
        onToggleSaveStates={() => setShowSaveStates((v) => !v)}
        onToggleInventory={() => widgets.toggle('inventory')}
        onToggleChecks={() => widgets.toggle('checks')}
        onShowDataManager={handleShowDataManager}
        onShowInputTester={() => nav.setActivePage('input-tester')}
        onShowCredits={() => nav.setActivePage('credits')}
        onShowSpriteDebug={() => setShowSpriteDebug(v => !v)}
        activeProfile={profileMgmt.activeProfile}
        gameRunning={isGameRunning}
        windowMode={display.windowMode}
        isMuted={audio.isMuted}
        onToggleMute={audio.handleToggleMute}
        showFps={display.showFps}
      />

      <div className="app__content">
        {!isGameRunning && (
          <img className="app__bg-logo" src="./logos/logo-512.png" alt="" />
        )}

        <GameLayer assetData={assetData} configIni={configIni} profileId={profileMgmt.activeProfile?.id} stretch={display.viewportConstraint !== 'none'} edgeEffect={display.overworldEdgeEffect} />

        <SaveStateOverlay
          open={saveOverlayOpen}
          onClose={handleSaveOverlayClose}
          highlightedSlot={enhancedSave.highlightedSlot}
          holdProgress={enhancedSave.holdProgress}
          hints={enhancedSave.hints}
        />

        {nav.activePage === 'picker' && (
          <FullScreenLayer onClose={nav.closePage}>
            <ProfilePicker
              profiles={profileMgmt.profiles}
              romStatuses={romDisplayInfos}
              onSelectProfile={(p: Profile) => { profileMgmt.handleSelectProfile(p); nav.setActivePage('profile'); }}
              onCreateProfile={(name: string, romFile: string) => { profileMgmt.handleCreateProfile(name, romFile); nav.setActivePage('profile'); }}
              onDeleteProfile={profileMgmt.handleDeleteProfile}
              onImportRom={profileMgmt.handleImportRom}
              onExtractAssets={profileMgmt.handleExtractAssets}
              onDeleteRom={profileMgmt.handleDeleteRom}
              importingRom={profileMgmt.importingRom}
              loadingProfile={profileMgmt.loadingProfile}
            />
          </FullScreenLayer>
        )}

        {nav.activePage === 'profile' && profileMgmt.activeProfile && (
          <FullScreenLayer onClose={nav.closePage}>
            <ProfileHub
              profile={profileMgmt.activeProfile}
              isGameRunning={isGameRunning}
              onStartGame={handleStartGame}
              onStopGame={handleStopGame}
              onResetGame={handleResetGame}
              onWindowModeChange={display.handleWindowModeChange}
              onConstraintSettingsChange={display.handleConstraintSettingsChange}
              onMasterVolumeChange={audio.handleMasterVolumeChange}
              onDisplayPerfChange={display.handleDisplayPerfChange}
              onEdgeEffectChange={display.handleEdgeEffectChange}
              onSaveSlotSettingsChange={saveState.handleSaveSlotSettingsChange}
              masterVolumeOverride={audio.muteOverride}
            />
          </FullScreenLayer>
        )}

        {nav.activePage === 'data' && (
          <FullScreenLayer onClose={nav.closePage}>
            <DataManager
              profiles={profileMgmt.profiles}
              romStatuses={romDisplayInfos}
              onSelectProfile={(p: Profile) => { profileMgmt.handleSelectProfile(p); nav.setActivePage('profile'); }}
              onCreateProfile={(name: string, rom: string, lang?: string, msu?: string) => { profileMgmt.handleCreateProfile(name, rom, lang, msu); nav.setActivePage('profile'); }}
              onDeleteProfile={profileMgmt.handleDeleteProfile}
              onImportRom={profileMgmt.handleImportRom}
              onExtractAssets={profileMgmt.handleExtractAssets}
              onDeleteRom={profileMgmt.handleDeleteRom}
              onRefresh={profileMgmt.refreshProfilesAndRoms}
              onDeleteConfirm={handleDeleteConfirm}
              loadingProfile={profileMgmt.loadingProfile}
              initialTab={dataTab as any}
              isGameRunning={isGameRunning}
              onSwitchProfile={handleShowPicker}
            />
          </FullScreenLayer>
        )}

        {nav.activePage === 'input-tester' && (
          <FullScreenLayer onClose={nav.closePage}>
            <InputCalibration />
          </FullScreenLayer>
        )}

        {nav.activePage === 'credits' && (
          <FullScreenLayer onClose={nav.closePage}>
            <CreditsPage />
          </FullScreenLayer>
        )}

        <WidgetManager
          layout={widgets.layout}
          gameRunning={isGameRunning}
          onUpdate={widgets.update}
          onClose={widgets.close}
          settingsContent={{
            inventory: <InventoryWidgetSettings />,
          }}
        >
          {{
            inventory: <InventoryWidgetContent />,
            checks: <ChecksWidgetContent />,
            logs: <LogsWidgetContent />,
          }}
        </WidgetManager>
        {showSpriteDebug && <SpriteDebug onClose={() => setShowSpriteDebug(false)} />}
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
