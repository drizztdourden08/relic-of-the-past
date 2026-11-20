/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { SpriteManager } from '@app/views/DataManager/sub-components/SpriteManager';

const meta: ScreenMeta = { title: msg('views-data-home:library.sprites.title'), icon: 'image', showHeader: true, order: 3, fill: true, keywords: ['sprite', 'extract', 'hud', 'items', 'graphics'] };

const SpritesPage = () => {
  const { profileMgmt } = useDataLibrary();
  return <SpriteManager romStatuses={profileMgmt.romDisplayInfos} />;
};

export default SpritesPage;
export { meta };
