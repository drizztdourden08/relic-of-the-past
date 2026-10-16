/* @layer renderer-appshell @kind hook */
import { useCallback, useEffect, useMemo } from 'react';
import { nav, useNavigationStore, widgets } from '@drizztdourden08/brock-react';
import { subscribeGameState } from '@rotp/game-core';
import type { GameSessionValue } from '../GameSession.type';
import { applyLoadedProfile } from './apply-loaded-profile';
import { useAppMainEffects } from './useAppMainEffects';
import { useAudioSettings } from './useAudioSettings';
import { useConfirmDialog } from './useConfirmDialog';
import { useDebugLaunchHooks } from './useDebugLaunchHooks';
import { useDisplaySettings } from './useDisplaySettings';
import { useGameLifecycle } from './useGameLifecycle';
import { useMsulOpen } from './useMsulOpen';
import { useOpenHubOnStart } from './useOpenHubOnStart';
import { useProfileManagement } from './useProfileManagement';
import { useRandomizerBoot } from './useRandomizerBoot';
import { useSaveOverlay } from './useSaveOverlay';
import { useSaveStateSettings } from './useSaveStateSettings';
import { useSettingsBridge } from './useSettingsBridge';
import { useShellBridges } from './useShellBridges';
import { useStoreLinks } from './useStoreLinks';

const openNavWidget = (): void => widgets.open('navigation');

const useGameSessionValue = (): GameSessionValue => {
  const dialogs = useConfirmDialog();
  const game = useGameLifecycle();
  const audio = useAudioSettings();
  const saveState = useSaveStateSettings();
  const display = useDisplaySettings({ isGameRunning: game.isRunning });
  const profileMgmt = useProfileManagement({
    showDialog: dialogs.showDialog,
    dismissDialog: dialogs.dismissDialog,
    onProfileLoaded: (data) => applyLoadedProfile(data, { game, display, audio, saveState }),
    onGameClear: () => game.clearGame(),
    onGameStop: () => game.stop(),
  });
  const saveOverlay = useSaveOverlay(saveState, game.isRunning);
  const screenOpen = useNavigationStore((s) => s.active !== null);
  const profileId = profileMgmt.activeProfile?.id ?? null;

  useSettingsBridge({
    isGameRunning: game.isRunning,
    masterVolumeOverride: audio.muteOverride,
    callbacks: {
      onWindowModeChange: display.handleWindowModeChange,
      onConstraintSettingsChange: display.handleConstraintSettingsChange,
      onMasterVolumeChange: audio.handleMasterVolumeChange,
      onDisplayPerfChange: display.handleDisplayPerfChange,
      onSaveSlotSettingsChange: saveState.handleSaveSlotSettingsChange,
      onEdgeEffectChange: display.handleEdgeEffectChange,
      onShadowCastingChange: display.handleShadowCastingChange,
      onPixelPerfectChange: display.handlePixelPerfectChange,
    },
  });
  useDebugLaunchHooks({ activeProfile: profileMgmt.activeProfile, loadProfileForGame: profileMgmt.loadProfileForGame, openNavWidget });
  useRandomizerBoot(profileId);
  useMsulOpen();
  useStoreLinks();
  useOpenHubOnStart(profileId);
  useShellBridges(game.isRunning);
  useAppMainEffects({ isGameRunning: game.isRunning, screenOpen, openNavWidget });
  useEffect(() => subscribeGameState((state) => {
    if (state.status === 'error') widgets.open('logs');
  }), []);

  const { activeProfile, loadProfileForGame } = profileMgmt;
  const startGame = useCallback(() => {
    if (!activeProfile) return;
    void loadProfileForGame(activeProfile);
    nav.close();
  }, [activeProfile, loadProfileForGame]);

  const { stop } = game;
  const resetGame = useCallback(() => {
    if (!activeProfile) return;
    void stop().then(() => loadProfileForGame(activeProfile));
  }, [activeProfile, stop, loadProfileForGame]);

  return useMemo(
    () => ({ dialogs, game, audio, display, saveState, saveOverlay, profileMgmt, startGame, resetGame }),
    [dialogs, game, audio, display, saveState, saveOverlay, profileMgmt, startGame, resetGame],
  );
};

export { useGameSessionValue };
