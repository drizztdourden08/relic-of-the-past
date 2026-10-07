/* @layer renderer-components @kind component */
/**
 * Home tab hero: the scene the host hands in as a full-bleed backdrop, the
 * mode's piece (sword, shield) beside the intro, and the profile's details floating
 * over it: mode + Play on the left, the last save on the right, facts and
 * per-file progress along the bottom. Drawn through the shared Hero.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import { Image } from '../../../../design-system/primitives/Image';
import { Text } from '../../../../design-system/primitives/Text';
import { Hero } from '../Hero';
import { HeroFacts } from '../HeroFacts';
import { MODE_BADGE_LABELS } from '../ModeBadge';
import { heroArtSrc } from './ProfileHero.constants';
import { HeroLastSaveTile } from './sub-components/HeroLastSaveTile';
import { HeroProgress } from './sub-components/HeroProgress';
import type { ProfileHeroProps } from './ProfileHero.type';
import './ProfileHero.css';

const ProfileHero = (props: ProfileHeroProps) => {
  const { mode, backdrop, actions, facts, runFacts, progress, lastSave, canRevealFolder, onOpenFolder, onImportSram } = props;
  const art = heroArtSrc(mode);

  const tools = (
    <>
      {canRevealFolder && (
        <Button variant="secondary" size="sm" icon="📂" onClick={onOpenFolder} title="Open this profile's folder">
          Folder
        </Button>
      )}
      <Button variant="secondary" size="sm" icon="📥" onClick={onImportSram} title="Import a raw SRAM save (.srm) from another emulator">
        Import
      </Button>
    </>
  );

  const intro = (
    <>
      <Text className="hero__eyebrow">Mode</Text>
      <Text as="h2" className="hero__title">{MODE_BADGE_LABELS[mode]}</Text>
      {actions && <Box className="hero__actions">{actions}</Box>}
    </>
  );

  const bottom = (
    <>
      <HeroFacts facts={facts} extraFacts={runFacts} />
      {progress && <HeroProgress files={progress} />}
    </>
  );

  return (
    <Hero
      ariaLabel="Profile overview"
      className={`profile-hero profile-hero--${mode}`}
      backdrop={backdrop}
      art={art && <Image className="hero__art profile-hero__art" src={art} alt="" />}
      tools={tools}
      intro={intro}
      side={lastSave && <HeroLastSaveTile save={lastSave} />}
      bottom={bottom}
    />
  );
};

export { ProfileHero };
