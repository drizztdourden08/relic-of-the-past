/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { MsuManager } from '@app/views/DataManager/sub-components/MsuManager';

const meta: ScreenMeta = { title: 'MSU Studio', icon: 'headphones', showHeader: true, order: 3, fill: true, keywords: ['msu', 'music', 'soundtrack', 'pcm', 'tracks', 'sounds'] };

const MsuPage = () => {
  const { onDeleteConfirm, refresh } = useDataLibrary();
  return <MsuManager onDeleteConfirm={onDeleteConfirm} onRefresh={refresh} />;
};

export default MsuPage;
export { meta };
