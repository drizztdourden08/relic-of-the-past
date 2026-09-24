/* @layer renderer-components @kind component */
/**
 * Home tab hero: the scene the host hands in as a full-bleed backdrop, the
 * mode's piece (sword, shield) beside the intro, and the profile's details floating
 * over it: mode + Play on the left, the last save on the right, facts and
 * per-file progress along the bottom.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import { Image } from '../../../../design-system/primitives/Image';
import { Text } from '../../../../design-system/primitives/Text';
import { MODE_BADGE_LABELS } from '../ModeBadge';
import { heroArtSrc } from './ProfileHero.constants';
import { HeroFacts } from './sub-components/HeroFacts';
import { HeroLastSaveTile } from './sub-components/HeroLastSaveTile';
import { HeroProgress } from './sub-components/HeroProgress';
import type { ProfileHeroProps } from './ProfileHero.type';
import './ProfileHero.css';

const ProfileHero = (props: ProfileHeroProps) => {
  const { mode, backdrop, actions, facts, runFacts, progress, lastSave, canRevealFolder, onOpenFolder, onImportSram } = props;
  const art = heroArtSrc(mode);

  return (
    <Box as="section" className={`profile-hero profile-hero--${mode}`} aria-label="Profile overview">
      <Box className="profile-hero__backdrop">{backdrop}</Box>
      {art && <Image className="profile-hero__art" src={art} alt="" />}
      <Box className="profile-hero__shade" aria-hidden="true" />

      <Box className="profile-hero__tools">
        {canRevealFolder && (
          <Button variant="secondary" size="sm" icon="📂" onClick={onOpenFolder} title="Open this profile's folder">
            Folder
          </Button>
        )}
        <Button variant="secondary" size="sm" icon="📥" onClick={onImportSram} title="Import a raw SRAM save (.srm) from another emulator">
          Import
        </Button>
      </Box>

      <Box className="profile-hero__main">
        <Box className="profile-hero__intro">
          <Text className="profile-hero__eyebrow">Mode</Text>
          <Text as="h2" className="profile-hero__title">{MODE_BADGE_LABELS[mode]}</Text>
          {actions && <Box className="profile-hero__actions">{actions}</Box>}
        </Box>
        {lastSave && <HeroLastSaveTile save={lastSave} />}
      </Box>

      <Box className="profile-hero__bottom">
        <HeroFacts facts={facts} runFacts={runFacts} />
        {progress && <HeroProgress files={progress} />}
      </Box>
    </Box>
  );
};

export { ProfileHero };
