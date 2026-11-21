/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Image, Text } from '@drizztdourden08/tessera/primitives';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { HeroLastSave } from '../ProfileHero.type';
import './HeroLastSaveTile.css';

const HeroLastSaveTile = (props: { save: HeroLastSave }) => {
  const t = useT();
  const { save } = props;
  return (
    <Box className="profile-hero__save">
      <Image
        frame
        src={save.screenshotUrl ?? undefined}
        alt={save.name}
        className="profile-hero__save-thumb"
        fallback={<Text className="profile-hero__save-empty">{t('compounds:profile-hero.no-screenshot')}</Text>}
      />
      <Box className="profile-hero__save-body">
        <Box className="profile-hero__save-text">
          <Text className="hero__eyebrow">{t('compounds:profile-hero.last-save')}</Text>
          <Text className="profile-hero__save-name" title={save.name}>{save.name}</Text>
          <Text className="profile-hero__save-time"><DateText value={save.timestamp} format="calendar" /></Text>
        </Box>
        <Button variant="tertiary" size="sm" onClick={save.onLoad} disabled={save.busy}>
          {t('compounds:profile-hero.load')}
        </Button>
      </Box>
    </Box>
  );
};

export { HeroLastSaveTile };
