import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { TitleBar } from './components/views/TitleBar';
import { GameLayer } from './components/views/GameLayer';
import { SaveStateOverlay } from './components/views/SaveStateOverlay/SaveStateOverlay';
import { ProfilePicker } from './components/views/ProfilePicker';
import { ProfileHub } from './components/views/ProfileHub';
import { DataManager } from './components/views/DataManager';
import { LogOverlay } from './components/views/LogOverlay';
import { TrackerView } from './components/views/TrackerView/TrackerView';
import { InputTester } from './components/views/InputTester';
import { FullScreenLayer } from './components/composites/FullScreenLayer';
import { Dialog } from './components/composites/Dialog';
import { log } from './lib/log-bus';
import type { LogChannel, LogLevel } from './lib/log-bus';
import { subscribeGameState, resetGame, setMasterVolume, setMsuData } from './lib/game';
import { serializeToIni, mergeSettings } from './lib/game/settings';
import './App.css';

const TITLEBAR_HEIGHT = 38;

/** Get the game ratio from canvas buffer or fall back to setting value. */
function getGameRatio(aspectRatio: GameSettings['aspectRatio']): number {
  const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
  if (canvas && canvas.width > 0 && canvas.height > 0) {
    return canvas.width / canvas.height;
  }
  switch (aspectRatio) {
    case '16:9':  return 16 / 9;
    case '16:10': return 16 / 10;
    case '18:9':  return 18 / 9;
    case '4:3':
    default:      return 4 / 3;
  }
}

/** Send the aspect-ratio lock command to the main process. */
function syncAspectRatioLock(constraint: GameSettings['viewportConstraint'], aspectRatio: GameSettings['aspectRatio'], wMode: GameSettings['windowMode'], fullscreen: boolean): void {
  if (constraint !== 'fit') {
    window.api.setAspectRatioLock(0, 0);
    return;
  }
  const ratio = getGameRatio(aspectRatio);
  const extra = (wMode === 'default' && !fullscreen) ? TITLEBAR_HEIGHT : 0;
  window.api.setAspectRatioLock(ratio, extra);
}

type PageId = 'none' | 'picker' | 'profile' | 'data' | 'input-tester';

interface ConfirmDialog {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'default';
  onConfirm: () => void;
}

export function App(): JSX.Element {
  const [activePage, setActivePage] = useState<PageId>('picker');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [romStatuses, setRomStatuses] = useState<RomInfo[]>([]);
  const [extractionStates, setExtractionStates] = useState<Record<string, RomExtractionStatus>>({});
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [importingRom, setImportingRom] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showSaveStates, setShowSaveStates] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null);
  const [gameCrashed, setGameCrashed] = useState(false);
  const [configIni, setConfigIni] = useState<string | undefined>(undefined);
  const [windowMode, setWindowMode] = useState<GameSettings['windowMode']>('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportConstraint, setViewportConstraint] = useState<GameSettings['viewportConstraint']>('none');
  const [aspectRatio, setAspectRatio] = useState<GameSettings['aspectRatio']>('4:3');
  const [masterVolume, setMasterVolumeState] = useState(100);
  const [showFps, setShowFps] = useState(false);
  const prevVolumeRef = useRef(100);
  const [muteOverride, setMuteOverride] = useState<{ volume: number; version: number } | null>(null);
  const muteVersionRef = useRef(0);
  const [dataTab, setDataTab] = useState<string>('profiles');

  // When windowMode changes, sync Electron (borderless = no frame, default = framed)
  const handleWindowModeChange = useCallback((mode: GameSettings['windowMode']) => {
    setWindowMode(mode);
  }, []);

  // Callback for ProfileHub to notify us when constraint-relevant settings change
  const handleConstraintSettingsChange = useCallback((constraint: GameSettings['viewportConstraint'], ar: GameSettings['aspectRatio']) => {
    setViewportConstraint(constraint);
    setAspectRatio(ar);
  }, []);

  // Callbacks for ProfileHub to notify us of volume/FPS display changes (titlebar sync)
  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    if (volume > 0) prevVolumeRef.current = volume;
  }, []);

  const handleDisplayPerfChange = useCallback((enabled: boolean) => {
    setShowFps(enabled);
  }, []);

  // Titlebar mute toggle: switch between 0 and previous volume
  const handleToggleMute = useCallback(() => {
    const v = ++muteVersionRef.current;
    if (masterVolume > 0) {
      prevVolumeRef.current = masterVolume;
      setMasterVolumeState(0);
      setMuteOverride({ volume: 0, version: v });
      setMasterVolume(0);
    } else {
      const restored = prevVolumeRef.current || 100;
      setMasterVolumeState(restored);
      setMuteOverride({ volume: restored, version: v });
      setMasterVolume(restored);
    }
  }, [masterVolume]);

  // Track fullscreen state for aspect ratio lock
  useEffect(() => {
    window.api.isFullscreen().then(setIsFullscreen);
    return window.api.onFullscreenChange(setIsFullscreen);
  }, []);

  // Compute display info combining server state + local extraction tracking
  const romDisplayInfos: RomDisplayInfo[] = romStatuses.map((rom) => ({
    ...rom,
    extractionStatus: extractionStates[rom.romFile] ?? (rom.hasAssets ? 'ready' : 'idle'),
  }));

  const isGameRunning = assetData != null && !gameCrashed;

  // ─── Aspect ratio lock ───
  // Sync lock when settings change (constraint, aspect ratio, window mode, fullscreen)
  // Only apply when a game is running — no lock while browsing settings.
  useEffect(() => {
    if (!isGameRunning) return;
    syncAspectRatioLock(viewportConstraint, aspectRatio, windowMode, isFullscreen);
  }, [isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen]);

  // Re-sync when game starts (canvas buffer dimensions become available)
  const vcRef = useRef(viewportConstraint);
  const arRef = useRef(aspectRatio);
  const wmRef = useRef(windowMode);
  const fsRef = useRef(isFullscreen);
  vcRef.current = viewportConstraint;
  arRef.current = aspectRatio;
  wmRef.current = windowMode;
  fsRef.current = isFullscreen;

  useEffect(() => {
    if (!isGameRunning) {
      // Game stopped — unlock
      if (vcRef.current === 'fit') {
        window.api.setAspectRatioLock(0, 0);
      }
      return;
    }
    if (vcRef.current !== 'fit') return;
    // Poll until canvas has valid buffer dimensions (game needs time to render first frame)
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
      if ((canvas && canvas.width > 0 && canvas.height > 0) || attempts >= 30) {
        clearInterval(poll);
        syncAspectRatioLock(vcRef.current, arRef.current, wmRef.current, fsRef.current);
      }
    }, 100);
    return () => clearInterval(poll);
  }, [isGameRunning]);

  // Subscribe to game state for crash detection
  useEffect(() => {
    return subscribeGameState((state) => {
      if (state.status === 'error') {
        setGameCrashed(true);
      }
    });
  }, []);

  // Bridge IPC log events from main process into LogBus
  useEffect(() => {
    return window.api.onLogEntry((entry) => {
      const channel = entry.channel as LogChannel;
      const level = entry.level as LogLevel;
      if (channel in log && typeof log[channel] === 'function') {
        log[channel](entry.message, level);
      }
    });
  }, []);

  // ─── ESC key: toggle profile page open/close ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt+Enter: toggle fullscreen
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        window.api.toggleFullscreen();
        return;
      }

      if (e.key !== 'Escape') return;

      // If dialog is open, close it
      if (dialog) {
        e.preventDefault();
        setDialog(null);
        return;
      }

      // If picker is open and we have a profile to go back to, close it
      if (activePage === 'picker' && activeProfile) {
        e.preventDefault();
        setActivePage('none');
        return;
      }

      // If data page is open, close it
      if (activePage === 'data') {
        e.preventDefault();
        setActivePage(activeProfile ? 'none' : 'picker');
        return;
      }

      // If profile page is open, close it
      if (activePage === 'profile') {
        e.preventDefault();
        setActivePage('none');
        return;
      }

      // If nothing is open and we have a profile, open profile page
      if (activePage === 'none' && activeProfile) {
        e.preventDefault();
        setActivePage('profile');
        return;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activePage, activeProfile, dialog]);

  // ─── Close current fullscreen page ───
  const closePage = useCallback(() => setActivePage('none'), []);

  // ─── Load profile for game ───
  const loadProfileForGame = useCallback(async (profile: Profile) => {
    // Reset any previous crash state
    resetGame();
    setGameCrashed(false);
    setAssetData(null);

    setActiveProfile(profile);
    setLoadingProfile(profile.name);
    setActivePage('none');
    log.app(`Loading profile: ${profile.name} (${profile.romFile})`);

    // Load profile settings and serialize to INI for WASM
    const savedSettings = await window.api.readConfig(profile.id);
    const settings = mergeSettings((savedSettings ?? {}) as any);

    // Load MSU pack into staging memory if enabled
    if (profile.msuPack && settings.enableMSU !== 'false') {
      log.app(`[MSU] Loading pack "${profile.msuPack}"...`);
      try {
        const trackList = await window.api.getMsuTrackList(profile.msuPack);
        if (trackList.length > 0) {
          const tracks: { num: number; ext: string; data: Uint8Array }[] = [];
          // Load files in batches of 5 for efficiency
          for (let i = 0; i < trackList.length; i += 5) {
            const batch = trackList.slice(i, i + 5);
            const results = await Promise.all(
              batch.map((t) => window.api.readMsuTrackFile(profile.msuPack!, t.fileName)),
            );
            for (let j = 0; j < batch.length; j++) {
              tracks.push({ num: batch[j].trackNum, ext: batch[j].ext, data: new Uint8Array(results[j]) });
            }
          }
          setMsuData(tracks);
          // Auto-detect deluxe packs (tracks >= 37)
          const hasDeluxe = tracks.some((t) => t.num >= 37);
          if (hasDeluxe && settings.enableMSU === 'true') {
            settings.enableMSU = 'deluxe';
            log.app(`[MSU] Deluxe pack detected — upgraded EnableMSU to 'deluxe'`);
          }
          log.app(`[MSU] Loaded ${tracks.length} tracks (${(tracks.reduce((s, t) => s + t.data.byteLength, 0) / (1024 * 1024)).toFixed(0)} MB)`);
        }
      } catch (err) {
        log.error(`[MSU] Failed to load pack: ${err instanceof Error ? err.message : err}`);
        setMsuData(null);
      }
    } else {
      setMsuData(null);
    }

    const msuPath = (profile.msuPack && settings.enableMSU !== 'false') ? '/msu/' : undefined;
    const ini = serializeToIni(settings, msuPath);
    setConfigIni(ini);
    setWindowMode(settings.windowMode);
    setViewportConstraint(settings.viewportConstraint);
    setAspectRatio(settings.aspectRatio);
    setMasterVolumeState(settings.masterVolume);
    setShowFps(settings.displayPerfInTitle);
    if (settings.masterVolume > 0) prevVolumeRef.current = settings.masterVolume;
    if (settings.startFullscreen) {
      window.api.setFullscreen(true);
    }
    log.app(`Loaded profile settings (aspect: ${settings.aspectRatio}, viewport: ${settings.viewportConstraint}, renderer: ${settings.newRenderer ? 'new' : 'old'})`);

    const hasAssets = await window.api.checkAssets(profile.romFile);
    if (!hasAssets) {
      log.app(`No cached assets for ${profile.romFile}, extracting...`);
      const result = await window.api.extractAssets(profile.romFile);
      if (!result.success) {
        log.error(`Extraction failed: ${result.error}`);
        setLoadingProfile(null);
        return;
      }
    }

    const buffer = await window.api.loadAssets(profile.romFile);
    if (buffer) {
      log.app(`Loaded assets (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
      setAssetData(new Uint8Array(buffer));
      await window.api.setLastProfile(profile.id);
      await window.api.updateLastPlayed(profile.id);
    } else {
      log.error('Failed to load assets after extraction');
    }
    setLoadingProfile(null);
  }, []);

  // ─── Startup: check profiles and auto-load ───
  useEffect(() => {
    (async () => {
      try {
        const [profileList, romStatusList, appState] = await Promise.all([
          window.api.listProfiles(),
          window.api.listRomsWithStatus(),
          window.api.getAppState(),
        ]);

        setProfiles(profileList);
        setRomStatuses(romStatusList);

        if (profileList.length === 0) {
          log.app('No profiles found, showing setup screen');
          setActivePage('picker');
        } else if (profileList.length === 1) {
          log.app('Single profile found, showing profile page...');
          setActiveProfile(profileList[0]);
          setActivePage('profile');
        } else {
          const lastProfile = appState.lastProfileId
            ? profileList.find((p) => p.id === appState.lastProfileId)
            : null;
          if (lastProfile) {
            log.app(`Resuming last profile: ${lastProfile.name}`);
            setActiveProfile(lastProfile);
            setActivePage('profile');
          } else {
            setActivePage('picker');
          }
        }
      } catch (err) {
        log.error(`Startup failed: ${err}`);
        setActivePage('picker');
      }
    })();
  }, []);

  // ─── Refresh profiles/roms list ───
  const refreshLists = useCallback(async () => {
    const [profileList, romStatusList] = await Promise.all([
      window.api.listProfiles(),
      window.api.listRomsWithStatus(),
    ]);
    setProfiles(profileList);
    setRomStatuses(romStatusList);
  }, []);

  // ─── Import ROM flow ───
  const handleImportRom = useCallback(async () => {
    const romPath = await window.api.openRomDialog();
    if (!romPath) return;

    setImportingRom(true);
    log.app(`Importing ROM: ${romPath}`);
    const result = await window.api.importRom(romPath);
    if (!result.success) {
      log.error(`Failed to import ROM: ${result.error}`);
      setImportingRom(false);
      return;
    }

    if (result.alreadyExists) {
      log.app(`ROM already imported: ${result.romFile}`);
    } else {
      log.app(`ROM imported: ${result.romFile}`);
    }

    log.app(`Extracting assets for ${result.romFile}...`);
    setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'extracting' }));
    await refreshLists();
    setImportingRom(false);

    const extractResult = await window.api.extractAssets(result.romFile);
    if (!extractResult.success) {
      log.error(`Extraction failed: ${extractResult.error}`);
      setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'failed' }));
    } else {
      setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'ready' }));
    }

    await refreshLists();
  }, [refreshLists]);

  // ─── Extract assets for a ROM from the picker ───
  const handleExtractAssets = useCallback(async (romFile: string) => {
    log.app(`Extracting assets for ${romFile}...`);
    setExtractionStates((prev) => ({ ...prev, [romFile]: 'extracting' }));
    const result = await window.api.extractAssets(romFile);
    if (!result.success) {
      log.error(`Extraction failed: ${result.error}`);
      setExtractionStates((prev) => ({ ...prev, [romFile]: 'failed' }));
    } else {
      setExtractionStates((prev) => ({ ...prev, [romFile]: 'ready' }));
    }
    await refreshLists();
  }, [refreshLists]);

  // ─── Delete ROM (with confirmation) ───
  const handleDeleteRom = useCallback((romFile: string) => {
    setDialog({
      title: 'Delete ROM',
      message: `This will remove "${romFile}" and all its extracted assets. Profiles using this ROM will also be deleted. This cannot be undone.`,
      confirmLabel: 'Delete ROM',
      variant: 'danger',
      onConfirm: async () => {
        setDialog(null);
        await window.api.deleteRom(romFile);
        log.app(`Removed ROM: ${romFile}`);
        setExtractionStates((prev) => {
          const next = { ...prev };
          delete next[romFile];
          return next;
        });
        // If active profile used this ROM, clear it
        if (activeProfile?.romFile === romFile) {
          setActiveProfile(null);
          setAssetData(null);
        }
        await refreshLists();
      },
    });
  }, [refreshLists, activeProfile]);

  // ─── Select profile from picker (no auto-start) ───
  const handleSelectProfile = useCallback(async (profile: Profile) => {
    setActiveProfile(profile);
    await window.api.setLastProfile(profile.id);
    setActivePage('profile');
  }, []);

  // ─── Create profile (no auto-start) ───
  const handleCreateProfile = useCallback(async (name: string, romFile: string, language?: string, msuPack?: string) => {
    const profile = await window.api.createProfile(name, romFile, language, msuPack);
    log.app(`Created profile: ${profile.name}`);
    await refreshLists();
    setActiveProfile(profile);
    await window.api.setLastProfile(profile.id);
    setActivePage('profile');
  }, [refreshLists]);

  // ─── Delete profile (with confirmation) ───
  const handleDeleteProfile = useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id);
    setDialog({
      title: 'Delete Profile',
      message: `Delete "${profile?.name ?? 'this profile'}"? Its save data will be lost. This cannot be undone.`,
      confirmLabel: 'Delete Profile',
      variant: 'danger',
      onConfirm: async () => {
        setDialog(null);
        await window.api.deleteProfile(id);
        log.app('Profile deleted');
        if (activeProfile?.id === id) {
          setActiveProfile(null);
          setAssetData(null);
        }
        await refreshLists();
      },
    });
  }, [profiles, activeProfile, refreshLists]);

  // ─── Switch to picker (with confirmation if game is running) ───
  const handleShowPicker = useCallback(async () => {
    if (isGameRunning) {
      setDialog({
        title: 'Switch Profile',
        message: 'This will close the currently running game. Any unsaved progress will be lost.',
        confirmLabel: 'Switch Profile',
        variant: 'default',
        onConfirm: async () => {
          setDialog(null);
          setAssetData(null);
          setActiveProfile(null);
          await refreshLists();
          setActivePage('picker');
        },
      });
    } else {
      await refreshLists();
      setActivePage('picker');
    }
  }, [isGameRunning, refreshLists]);

  // ─── Show profile page (home) ───
  const handleShowProfile = useCallback(async () => {
    if (activeProfile) {
      await refreshLists();
      setActivePage('profile');
    }
  }, [activeProfile, refreshLists]);

  // ─── Show data manager ───
  const handleShowDataManager = useCallback(async (tab?: string) => {
    if (tab) setDataTab(tab);
    await refreshLists();
    setActivePage('data');
  }, [refreshLists]);

  // ─── Delete confirm helper for sub-components ───
  const handleDeleteConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setDialog({
      title,
      message,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => { setDialog(null); onConfirm(); },
    });
  }, []);

  // ─── Start game from profile page ───
  const handleStartGame = useCallback(() => {
    if (activeProfile) {
      loadProfileForGame(activeProfile);
    }
  }, [activeProfile, loadProfileForGame]);

  // ─── Stop game ───
  const handleStopGame = useCallback(() => {
    resetGame();
    setAssetData(null);
    setGameCrashed(false);
  }, []);

  // ─── Reset game (stop + restart) ───
  const handleResetGame = useCallback(() => {
    if (activeProfile) {
      resetGame();
      setAssetData(null);
      setGameCrashed(false);
      // Restart immediately
      loadProfileForGame(activeProfile);
    }
  }, [activeProfile, loadProfileForGame]);

  return (
    <div className="app">
      <TitleBar
        onImportRom={handleImportRom}
        onSwitchProfile={handleShowPicker}
        onShowProfile={handleShowProfile}
        onShowLogs={() => setShowLogs((v) => !v)}
        onToggleSaveStates={() => setShowSaveStates((v) => !v)}
        onToggleTracker={() => setShowTracker((v) => !v)}
        onShowDataManager={handleShowDataManager}
        onShowInputTester={() => setActivePage('input-tester')}
        activeProfile={activeProfile}
        gameRunning={isGameRunning}
        windowMode={windowMode}
        isMuted={masterVolume === 0}
        onToggleMute={handleToggleMute}
        showFps={showFps}
      />

      <div className="app__content">
        {/* Game canvas — always present as background layer */}
        <GameLayer assetData={assetData} configIni={configIni} profileId={activeProfile?.id} stretch={viewportConstraint !== 'none'} />

        {/* Save State Overlay */}
        <SaveStateOverlay
          open={showSaveStates && isGameRunning}
          onClose={() => setShowSaveStates(false)}
        />

        {/* Full-screen pages (one at a time) */}
        {activePage === 'picker' && (
          <FullScreenLayer onClose={closePage}>
            <ProfilePicker
              profiles={profiles}
              romStatuses={romDisplayInfos}
              onSelectProfile={handleSelectProfile}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
              onImportRom={handleImportRom}
              onExtractAssets={handleExtractAssets}
              onDeleteRom={handleDeleteRom}
              importingRom={importingRom}
              loadingProfile={loadingProfile}
            />
          </FullScreenLayer>
        )}

        {activePage === 'profile' && activeProfile && (
          <FullScreenLayer onClose={closePage}>
            <ProfileHub
              profile={activeProfile}
              isGameRunning={isGameRunning}
              onStartGame={handleStartGame}
              onStopGame={handleStopGame}
              onResetGame={handleResetGame}
              onWindowModeChange={handleWindowModeChange}
              onConstraintSettingsChange={handleConstraintSettingsChange}
              onMasterVolumeChange={handleMasterVolumeChange}
              onDisplayPerfChange={handleDisplayPerfChange}
              masterVolumeOverride={muteOverride}
            />
          </FullScreenLayer>
        )}

        {activePage === 'data' && (
          <FullScreenLayer onClose={closePage}>
            <DataManager
              profiles={profiles}
              romStatuses={romDisplayInfos}
              onSelectProfile={handleSelectProfile}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
              onImportRom={handleImportRom}
              onExtractAssets={handleExtractAssets}
              onDeleteRom={handleDeleteRom}
              onRefresh={refreshLists}
              onDeleteConfirm={handleDeleteConfirm}
              loadingProfile={loadingProfile}
              initialTab={dataTab as any}
              isGameRunning={isGameRunning}
              onSwitchProfile={handleShowPicker}
            />
          </FullScreenLayer>
        )}

        {activePage === 'input-tester' && (
          <FullScreenLayer onClose={closePage}>
            <InputTester />
          </FullScreenLayer>
        )}

        <LogOverlay visible={showLogs} onClose={() => setShowLogs(false)} />
        <TrackerView visible={showTracker} onClose={() => setShowTracker(false)} />
      </div>

      <Dialog
        open={dialog != null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel={dialog?.confirmLabel}
        variant={dialog?.variant}
        onConfirm={dialog?.onConfirm ?? (() => {})}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
