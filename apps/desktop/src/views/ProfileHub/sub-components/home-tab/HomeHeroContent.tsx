/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useRevealProfileFolder } from '@app/hooks/useRevealProfileFolder';
import { SceneBackdrop } from '@app/title';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import { factGroupOf } from '@app/compounds/ProfileHero/behavior/fact-group-of';
import { heroArtSrc } from '@app/compounds/ProfileHero/behavior/hero-art-src';
import { HeroLastSaveTile } from '@app/compounds/ProfileHero/sub-components/HeroLastSaveTile';
import { HeroProgress } from '@app/compounds/ProfileHero/sub-components/HeroProgress';
import { HeroTools } from '@app/compounds/ProfileHero/sub-components/HeroTools';
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

const backdrop = <SceneBackdrop />;

const HomeHeroContent = (props: HomeHeroContentProps) => {
  const { slots, profile, isGameRunning, onStartGame, onStopGame, onResetGame, vanillaSafe } = props;
  const { Eyebrow, Title, Backdrop, Art, Actions, Tools, Facts, Aside, Panel } = slots;
  const { id: profileId, romFile, lastPlayed, created, randomizer } = profile;
  const saves = useHomeTabSaves({ profileId, isGameRunning, onStartGame });
  const { heroSave, normalScreenshots, busyNormal, handleLoadNormal, handleImportSram } = saves;
  const { reveal, canReveal } = useRevealProfileFolder(profileId);
  const randomizerStatus = useHomeRandomizerStatus();
  const mode = deriveProfileMode(randomizer, vanillaSafe);
  const progress = useHomeSaveFileChecks(profileId, mode, isGameRunning);
  const art = heroArtSrc(mode);

  const facts = useMemo(() => {
    const run = buildRandomizerFacts(randomizer, randomizerStatus);
    const own = factGroupOf(buildProfileFacts({ romFile, lastPlayed, created }));
    return run ? [own, factGroupOf(run)] : [own];
  }, [romFile, lastPlayed, created, randomizer, randomizerStatus]);

  const handleImportSramClick = useCallback(() => void handleImportSram(), [handleImportSram]);

  const lastSave = useMemo(() => (heroSave ? {
    name: heroSave.name,
    timestamp: heroSave.timestamp,
    screenshotUrl: normalScreenshots[heroSave.id] ?? null,
    busy: busyNormal === heroSave.id,
    onLoad: () => void handleLoadNormal(heroSave.id),
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
        <HeroTools canRevealFolder={canReveal} onOpenFolder={reveal} onImportSram={handleImportSramClick} />
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
