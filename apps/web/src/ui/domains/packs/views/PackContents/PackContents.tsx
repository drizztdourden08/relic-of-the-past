/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';
import { MusicContents } from './sub-components/MusicContents';
import { CharacterContents } from './sub-components/CharacterContents';
import { LanguageContents } from './sub-components/LanguageContents';
import type { PackContentsProps } from './PackContents.type';
import './PackContents.css';

const PackContents = (props: PackContentsProps) => {
  const { kind, source, className } = props;

  return (
    <Box className={`pack-contents${className ? ` ${className}` : ''}`}>
      {kind === 'music' ? <MusicContents source={source} /> : null}
      {kind === 'character' ? <CharacterContents source={source} /> : null}
      {kind === 'language' ? <LanguageContents source={source} /> : null}
    </Box>
  );
};

export { PackContents };
