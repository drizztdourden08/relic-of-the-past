/* @layer renderer-components @kind component */
import { SpriteSheetViewer } from '../../../../packs/character/compounds/SpriteSheetViewer';
import { readCharacterPack } from '../../behavior/read-character-pack';
import { usePackRead } from '../../behavior/usePackRead';
import { ContentsStatus } from '../ContentsStatus';
import type { PackSourceProps } from '../../PackContents.type';

const CharacterContents = (props: PackSourceProps) => {
  const { source } = props;
  const { data, error } = usePackRead(source, readCharacterPack);

  if (!data) return <ContentsStatus error={error} />;
  return <SpriteSheetViewer sheet={data} />;
};

export { CharacterContents };
