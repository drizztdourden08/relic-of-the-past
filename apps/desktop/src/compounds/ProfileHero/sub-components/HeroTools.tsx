/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import type { HeroToolsProps } from '../ProfileHero.type';

const HeroTools = ({ canRevealFolder, onOpenFolder, onImportSram }: HeroToolsProps) => {
  const t = useT();
  return (
  <>
    {canRevealFolder && (
      <Button variant="secondary" size="sm" icon={<Icon name="folder-open" />} onClick={onOpenFolder} title={t('compounds:profile-hero.open-this-profile-s-folder')}>
        {t('compounds:profile-hero.folder')}
      </Button>
    )}
    <Button variant="secondary" size="sm" icon={<Icon name="download" />} onClick={onImportSram} title={t('compounds:profile-hero.import-a-raw-sram-save')}>
      {t('compounds:profile-hero.import')}
    </Button>
  </>
  );
};

export { HeroTools };
