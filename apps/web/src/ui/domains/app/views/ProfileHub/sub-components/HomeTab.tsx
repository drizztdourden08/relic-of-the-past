/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { usePlatform } from '@app/platform';
import { log } from '@app/lib/log-bus';
import { HeroSaveCard } from '../../../compounds/HeroSaveCard';
import { Box } from '../../../../../design-system/primitives/Box';
import { ToastContainer } from '../../../../../design-system/primitives/Toast';
import { useHomeTabSaves } from './home-tab/useHomeTabSaves';
import { useHomeRandomizerStatus } from './home-tab/useHomeRandomizerStatus';
import { useHomeSaveFileChecks } from './home-tab/useHomeSaveFileChecks';
import { deriveProfileMode } from './home-tab/derive-profile-mode';
import { buildProfileFacts, buildRandomizerFacts } from './home-tab/build-summary-facts';
import { HomeTabSummary } from './home-tab/HomeTabSummary';
import { HomeTabColumns } from './home-tab/HomeTabColumns';
import { HomeTabDialogs } from './home-tab/HomeTabDialogs';
import type { HomeTabProps } from './home-tab/home-tab.type';
import './HomeTab.css';

const HomeTab = (props: HomeTabProps) => {
  const { profileId, romFile, isGameRunning, onStartGame, lastPlayed, created, windowMode, randomizer, vanillaSafe } = props;
  const saves = useHomeTabSaves({ profileId, isGameRunning, onStartGame });
  const { heroSave, normalScreenshots, busyNormal, handleLoadNormal, handleImportSram, toasts, dismissToast } = saves;
  const { storage, capabilities } = usePlatform();
  const randomizerStatus = useHomeRandomizerStatus();
  const saveFileChecks = useHomeSaveFileChecks(profileId, randomizer !== undefined, isGameRunning);

  const mode = deriveProfileMode(randomizer, vanillaSafe);
  const facts = useMemo(
    () => buildProfileFacts({ mode, romFile, lastPlayed, created, windowMode }),
    [mode, romFile, lastPlayed, created, windowMode],
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
      <HomeTabSummary
        mode={mode}
        facts={facts}
        randomizerFacts={randomizerFacts}
        saveFileChecks={saveFileChecks}
        canRevealFolder={capabilities.revealDataFolder}
        onOpenFolder={() => void handleOpenFolder()}
        onImportSram={() => void handleImportSram()}
      />

      {/* Hero card for the last normal save */}
      {heroSave && (
        <HeroSaveCard
          name={heroSave.name}
          timestamp={heroSave.timestamp}
          screenshotUrl={normalScreenshots[heroSave.id] ?? null}
          onLoad={() => handleLoadNormal(heroSave.id)}
          busy={busyNormal === heroSave.id}
        />
      )}

      <HomeTabColumns saves={saves} isGameRunning={isGameRunning} />
      <HomeTabDialogs saves={saves} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-left" />
    </Box>
  );
};

export { HomeTab };
