/* @layer renderer-app @kind component */
import { StoragePage } from '@drizztdourden08/brock-react';
import type { ScreenMeta } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Storage', icon: 'hard-drive', order: 9, keywords: ['data', 'disk', 'folder', 'export', 'import', 'clean', 'backup'] };

const StorageScreen = () => <StoragePage />;

export default StorageScreen;
export { meta };
