/* @layer renderer-components @kind component */
/** A character pack's sprite sheet, drawn by the Studio's own viewer. */
import { SpriteSheetViewer } from '../../../../character/compounds/SpriteSheetViewer';
import { readCharacterPack } from '../../behavior/read-character-pack';
import { usePackRead } from '../../behavior/usePackRead';
import { ContentsStatus } from '../ContentsStatus';
import type { PackSource } from '../../../../pack-source.type';

type CharacterContentsProps = {
  source: PackSource;
};

const CharacterContents = (props: CharacterContentsProps) => {
  const { source } = props;
  const { data, error } = usePackRead(source, readCharacterPack);

  if (!data) return <ContentsStatus error={error} />;
  return <SpriteSheetViewer sheet={data} />;
};

export { CharacterContents };
export type { CharacterContentsProps };
