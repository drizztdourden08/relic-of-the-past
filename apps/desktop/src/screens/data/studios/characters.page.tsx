/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { PlayerSpriteStudio } from '@app/views/PlayerSpriteStudio';

const meta: ScreenMeta = { title: 'Character Studio', icon: 'user', showHeader: true, order: 1, fill: true, keywords: ['character', 'player sprite', 'zspr', 'rsp', 'palette', 'outfit'] };

const CharactersPage = () => {
  const { profileMgmt, onDeleteConfirm } = useDataLibrary();
  return <PlayerSpriteStudio romStatuses={profileMgmt.romDisplayInfos} onDeleteConfirm={onDeleteConfirm} />;
};

export default CharactersPage;
export { meta };
