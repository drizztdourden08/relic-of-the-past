/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@domains/app/views/DataManager/behavior/useDataLibrary';
import { SpriteManager } from '@domains/app/views/DataManager/sub-components/SpriteManager';

const meta: ScreenMeta = { title: 'Sprites', icon: 'image', order: 3, fill: true, keywords: ['sprite', 'extract', 'hud', 'items', 'graphics'] };

const SpritesPage = () => {
  const { profileMgmt } = useDataLibrary();
  return <SpriteManager romStatuses={profileMgmt.romDisplayInfos} />;
};

export default SpritesPage;
export { meta };
