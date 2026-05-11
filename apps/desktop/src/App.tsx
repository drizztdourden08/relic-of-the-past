import { useState, useCallback, useEffect } from 'react';
import { TitleBar } from './components/views/TitleBar';
import { GameLayer } from './components/views/GameLayer';
import { SaveStateOverlay } from './components/views/SaveStateOverlay/SaveStateOverlay';
import { ProfilePicker } from './components/views/ProfilePicker';
import { ProfileHub } from './components/views/ProfileHub';
import { LogOverlay } from './components/views/LogOverlay';
import { FullScreenLayer } from './components/composites/FullScreenLayer';
import { Dialog } from './components/composites/Dialog';
import { log } from './lib/log-bus';
import type { LogChannel, LogLevel } from './lib/log-bus';
import { subscribeGameState, resetGame } from './lib/game';
import { serializeToIni, mergeSettings } from './lib/game/settings';

type PageId = 'none' | 'picker' | 'profile';

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
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null);
  const [gameCrashed, setGameCrashed] = useState(false);
  const [configIni, setConfigIni] = useState<string | undefined>(undefined);

  // Compute display info combining server state + local extraction tracking
  const romDisplayInfos: RomDisplayInfo[] = romStatuses.map((rom) => ({
    ...rom,
    extractionStatus: extractionStates[rom.romFile] ?? (rom.hasAssets ? 'ready' : 'idle'),
  }));

  const isGameRunning = assetData != null && !gameCrashed;

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
    const ini = serializeToIni(settings);
    setConfigIni(ini);
    log.app(`Loaded profile settings (aspect: ${settings.aspectRatio}, renderer: ${settings.newRenderer ? 'new' : 'old'})`);

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
  const handleCreateProfile = useCallback(async (name: string, romFile: string) => {
    const profile = await window.api.createProfile(name, romFile);
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
        activeProfile={activeProfile}
        gameRunning={isGameRunning}
      />

      {/* Game canvas — always present as background layer */}
      <GameLayer assetData={assetData} configIni={configIni} profileId={activeProfile?.id} />

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
          />
        </FullScreenLayer>
      )}

      <LogOverlay visible={showLogs} onClose={() => setShowLogs(false)} />

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
