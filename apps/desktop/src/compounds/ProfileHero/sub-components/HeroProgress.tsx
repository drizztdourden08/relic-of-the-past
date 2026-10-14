/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { HeroProgressFile } from '../ProfileHero.type';
import { HeroProgressRow } from './HeroProgressRow';
import './HeroProgress.css';

const HeroProgress = (props: { files: HeroProgressFile[] }) => {
  const { files } = props;
  return (
    <Box className="hero-progress">
      <Box className="hero-progress__head">
        <Text className="hero__eyebrow hero-progress__eyebrow">Progress</Text>
        <Box className="hero-progress__legend" aria-hidden="true">
          <Text as="span" className="hero-progress__key hero-progress__key--taken">Taken</Text>
          <Text as="span" className="hero-progress__key hero-progress__key--available">Available</Text>
          <Text as="span" className="hero-progress__key">Left</Text>
        </Box>
      </Box>
      {files.map((file) => <HeroProgressRow key={file.slot} file={file} />)}
    </Box>
  );
};

export { HeroProgress };
