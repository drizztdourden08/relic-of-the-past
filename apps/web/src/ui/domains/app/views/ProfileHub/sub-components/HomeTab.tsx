/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { usePlatform } from '@app/platform';
import { log } from '@app/lib/log-bus';
import { ProfileHero } from '../../../compounds/ProfileHero';
import { SceneBackdrop } from '../../../../title';
import { HubGameControls } from './HubGameControls';
import { Box } from '../../../../../design-system/primitives/Box';
import { ToastContainer } from '../../../../../design-system/primitives/Toast';
import { useHomeTabSaves } from './home-tab/useHomeTabSaves';
import { useHomeRandomizerStatus } from './home-tab/useHomeRandomizerStatus';
import { useHomeSaveFileChecks } from './home-tab/useHomeSaveFileChecks';
import { deriveProfileMode } from './home-tab/derive-profile-mode';
import { buildProfileFacts, buildRandomizerFacts } from './home-tab/build-summary-facts';
import { HomeTabColumns } from './home-tab/HomeTabColumns';
import { HomeTabDialogs } from './home-tab/HomeTabDialogs';
import type { HomeTabProps } from './home-tab/home-tab.type';
import './HomeTab.css';

const HomeTab = (props: HomeTabProps) => {
  const { profileId, romFile, isGameRunning, onStartGame, onStopGame, onResetGame, lastPlayed, created, randomizer, vanillaSafe } = props;
  const saves = useHomeTabSaves({ profileId, isGameRunning, onStartGame });
  const { heroSave, normalScreenshots, busyNormal, handleLoadNormal, handleImportSram, toasts, dismissToast } = saves;
  const { storage, capabilities } = usePlatform();
  const randomizerStatus = useHomeRandomizerStatus();
  const mode = deriveProfileMode(randomizer, vanillaSafe);
  const saveFileChecks = useHomeSaveFileChecks(profileId, mode, isGameRunning);

  const facts = useMemo(
    () => buildProfileFacts({ romFile, lastPlayed, created }),
    [romFile, lastPlayed, created],
  );
  const randomizerFacts = useMemo(
    () => buildRandomizerFacts(randomizer, randomizerStatus),
    [randomizer, randomizerStatus],
  );

  const handleOpenFolder = useCallback(async () => {
    try {
      const opened = await storage.revealProfile(profileId);
      if (!opened) log.app('Could not open the profile folder', 'warn');
    } catch (e: unknown) {
      log.app(`Could not open the profile folder: ${e instanceof Error ? e.message : e}`, 'error');
    }
  }, [storage, profileId]);

  return (
    <Box className="home-tab">
      <ProfileHero
        mode={mode}
        backdrop={<SceneBackdrop />}
        facts={facts}
        runFacts={randomizerFacts}
        progress={saveFileChecks}
        lastSave={heroSave ? {
          name: heroSave.name,
          timestamp: heroSave.timestamp,
          screenshotUrl: normalScreenshots[heroSave.id] ?? null,
          busy: busyNormal === heroSave.id,
          onLoad: () => handleLoadNormal(heroSave.id),
        } : null}
        actions={(
          <HubGameControls
            isGameRunning={isGameRunning}
            showPlay
            size="md"
            onStartGame={onStartGame}
            onStopGame={onStopGame}
            onResetGame={onResetGame}
          />
        )}
        canRevealFolder={capabilities.revealDataFolder}
        onOpenFolder={() => void handleOpenFolder()}
        onImportSram={() => void handleImportSram()}
      />

      <HomeTabColumns saves={saves} isGameRunning={isGameRunning} />
      <HomeTabDialogs saves={saves} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-left" />
    </Box>
  );
};

export { HomeTab };
