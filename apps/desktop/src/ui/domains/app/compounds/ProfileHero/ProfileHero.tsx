/* @layer renderer-components @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { Hero } from '@drizztdourden08/tessera/composites';
import { MODE_BADGE_LABELS } from '../ModeBadge';
import { factGroupOf } from './behavior/fact-group-of';
import { heroArtSrc } from './behavior/hero-art-src';
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
        <Button variant="secondary" size="sm" icon={<Icon name="folder-open" />} onClick={onOpenFolder} title="Open this profile's folder">
          Folder
        </Button>
      )}
      <Button variant="secondary" size="sm" icon={<Icon name="download" />} onClick={onImportSram} title="Import a raw SRAM save (.srm) from another emulator">
        Import
      </Button>
    </>
  );

  return (
    <Hero
      label="Profile overview"
      className={`profile-hero profile-hero--${mode}`}
      eyebrow="Mode"
      title={MODE_BADGE_LABELS[mode]}
      actions={actions}
      backdrop={backdrop === undefined ? null : { kind: 'node', node: backdrop }}
      art={art === null ? null : { kind: 'image', src: art, alt: '', pixelated: true }}
      tools={tools}
      aside={lastSave && <HeroLastSaveTile save={lastSave} />}
      facts={runFacts ? [factGroupOf(facts), factGroupOf(runFacts)] : [factGroupOf(facts)]}
      panel={progress && <HeroProgress files={progress} />}
    />
  );
};

export { ProfileHero };
