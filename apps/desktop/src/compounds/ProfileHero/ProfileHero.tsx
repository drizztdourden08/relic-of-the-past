/* @layer renderer-components @kind component */
import { Hero } from '@drizztdourden08/tessera/composites';
import { MODE_BADGE_LABELS } from '../ModeBadge';
import { factGroupOf } from './behavior/fact-group-of';
import { heroArtSrc } from './behavior/hero-art-src';
import { HeroLastSaveTile } from './sub-components/HeroLastSaveTile';
import { HeroProgress } from './sub-components/HeroProgress';
import { HeroTools } from './sub-components/HeroTools';
import type { ProfileHeroProps } from './ProfileHero.type';

const ProfileHero = (props: ProfileHeroProps) => {
  const { mode, backdrop, actions, facts, runFacts, progress, lastSave, canRevealFolder, onOpenFolder, onImportSram } = props;
  const art = heroArtSrc(mode);

  return (
    <Hero
      label="Profile overview"
      className={`profile-hero profile-hero--${mode}`}
      eyebrow="Mode"
      title={MODE_BADGE_LABELS[mode]}
      actions={actions}
      backdrop={backdrop === undefined ? null : { kind: 'node', node: backdrop }}
      art={art === null ? null : { kind: 'image', src: art, alt: '', pixelated: true }}
      tools={<HeroTools canRevealFolder={canRevealFolder} onOpenFolder={onOpenFolder} onImportSram={onImportSram} />}
      aside={lastSave && <HeroLastSaveTile save={lastSave} />}
      facts={runFacts ? [factGroupOf(facts), factGroupOf(runFacts)] : [factGroupOf(facts)]}
      panel={progress && <HeroProgress files={progress} />}
    />
  );
};

export { ProfileHero };
