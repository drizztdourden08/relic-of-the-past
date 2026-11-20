/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { HeroProgressFile } from '../ProfileHero.type';
import { HeroProgressRow } from './HeroProgressRow';
import './HeroProgress.css';

const HeroProgress = (props: { files: HeroProgressFile[] }) => {
  const { files } = props;
  const t = useT();
  return (
    <Box className="hero-progress">
      <Box className="hero-progress__head">
        <Text className="hero__eyebrow hero-progress__eyebrow">{t('compounds:profile-hero.progress')}</Text>
        <Box className="hero-progress__legend" aria-hidden="true">
          <Text as="span" className="hero-progress__key hero-progress__key--taken">{t('compounds:profile-hero.legend.taken')}</Text>
          <Text as="span" className="hero-progress__key hero-progress__key--available">{t('compounds:profile-hero.legend.available')}</Text>
          <Text as="span" className="hero-progress__key">{t('compounds:profile-hero.legend.left')}</Text>
        </Box>
      </Box>
      {files.map((file) => <HeroProgressRow key={file.slot} file={file} />)}
    </Box>
  );
};

export { HeroProgress };
