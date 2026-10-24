/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { SpriteManager } from '@app/views/DataManager/sub-components/SpriteManager';

const meta: ScreenMeta = { title: 'Sprites', icon: 'image', showHeader: true, order: 3, fill: true, keywords: ['sprite', 'extract', 'hud', 'items', 'graphics'] };

const SpritesPage = () => {
  const { profileMgmt } = useDataLibrary();
  return <SpriteManager romStatuses={profileMgmt.romDisplayInfos} />;
};

export default SpritesPage;
export { meta };
