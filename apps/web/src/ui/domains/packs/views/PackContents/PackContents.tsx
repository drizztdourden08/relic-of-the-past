/* @layer renderer-components @kind component */
/**
 * What is inside a pack, drawn by the viewer for its kind: the track list, the sprite sheet or
 * the dialogue. The one piece of the packs domain that reads, and only through the source it is
 * handed, so the app and the store show a pack the same way wherever its bytes live.
 */
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
