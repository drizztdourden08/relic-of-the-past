/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { Box, Button, Icon } from '@drizztdourden08/tessera/primitives';
import { log } from '@app/log-bus';
import { SceneBackdrop } from '@app/title';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import { factGroupOf } from '@app/compounds/ProfileHero/behavior/fact-group-of';
import { heroArtSrc } from '@app/compounds/ProfileHero/behavior/hero-art-src';
import { HeroLastSaveTile } from '@app/compounds/ProfileHero/sub-components/HeroLastSaveTile';
import { HeroProgress } from '@app/compounds/ProfileHero/sub-components/HeroProgress';
import { HubGameControls } from '../HubGameControls';
import { HomeTabColumns } from './HomeTabColumns';
import { HomeTabDialogs } from './HomeTabDialogs';
import { buildRandomizerFacts } from './build-randomizer-facts';
import { buildProfileFacts } from './build-summary-facts';
import { deriveProfileMode } from './derive-profile-mode';
import { useHomeRandomizerStatus } from './useHomeRandomizerStatus';
import { useHomeSaveFileChecks } from './useHomeSaveFileChecks';
import { useHomeTabSaves } from './useHomeTabSaves';
import type { HomeHeroContentProps } from './home-tab.type';
import './HomeHeroContent.css';

const backdrop = <SceneBackdrop />;

const HomeHeroContent = (props: HomeHeroContentProps) => {
  const { slots, profile, isGameRunning, onStartGame, onStopGame, onResetGame, vanillaSafe } = props;
  const { Eyebrow, Title, Backdrop, Art, Actions, Tools, Facts, Aside, Panel } = slots;
  const { id: profileId, romFile, lastPlayed, created, randomizer } = profile;
  const saves = useHomeTabSaves({ profileId, isGameRunning, onStartGame });
  const { heroSave, normalScreenshots, busyNormal, handleLoadNormal, handleImportSram } = saves;
  const { storage, capabilities } = usePlatform();
  const randomizerStatus = useHomeRandomizerStatus();
  const mode = deriveProfileMode(randomizer, vanillaSafe);
  const progress = useHomeSaveFileChecks(profileId, mode, isGameRunning);
  const art = heroArtSrc(mode);

  const facts = useMemo(() => {
    const run = buildRandomizerFacts(randomizer, randomizerStatus);
    const own = factGroupOf(buildProfileFacts({ romFile, lastPlayed, created }));
    return run ? [own, factGroupOf(run)] : [own];
  }, [romFile, lastPlayed, created, randomizer, randomizerStatus]);

  const handleOpenFolder = useCallback(() => {
    storage.revealProfile(profileId)
      .then((opened) => { if (!opened) log.app('Could not open the profile folder', 'warn'); })
      .catch((e: unknown) => log.app(`Could not open the profile folder: ${e instanceof Error ? e.message : String(e)}`, 'error'));
  }, [storage, profileId]);
  const handleImportSramClick = useCallback(() => void handleImportSram(), [handleImportSram]);

  const lastSave = useMemo(() => (heroSave ? {
    name: heroSave.name,
    timestamp: heroSave.timestamp,
    screenshotUrl: normalScreenshots[heroSave.id] ?? null,
    busy: busyNormal === heroSave.id,
    onLoad: () => handleLoadNormal(heroSave.id),
  } : null), [heroSave, normalScreenshots, busyNormal, handleLoadNormal]);

  return (
    <>
      <Eyebrow>Mode</Eyebrow>
      <Title>{MODE_BADGE_LABELS[mode]}</Title>
      <Backdrop kind="node" node={backdrop} />
      {art !== null && <Art kind="image" src={art} alt="" pixelated />}
      <Actions>
        <HubGameControls isGameRunning={isGameRunning} showPlay size="md" onStartGame={onStartGame} onStopGame={onStopGame} onResetGame={onResetGame} />
      </Actions>
      <Tools>
        {capabilities.revealDataFolder && (
          <Button variant="secondary" size="sm" icon={<Icon name="folder-open" />} onClick={handleOpenFolder} title="Open this profile's folder">Folder</Button>
        )}
        <Button variant="secondary" size="sm" icon={<Icon name="download" />} onClick={handleImportSramClick} title="Import a raw SRAM save (.srm) from another emulator">Import</Button>
      </Tools>
      <Facts rows={facts} />
      {lastSave && <Aside><HeroLastSaveTile save={lastSave} /></Aside>}
      {progress && <Panel><HeroProgress files={progress} /></Panel>}
      <Box className="home-tab">
        <HomeTabColumns saves={saves} isGameRunning={isGameRunning} />
        <HomeTabDialogs saves={saves} />
      </Box>
    </>
  );
};

export { HomeHeroContent };
