/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { isSignedIn } from '@app/shell/show-rules';
import { StoreInstalledView } from '@app/views/Store/sub-components/StoreInstalledView';

const meta: ScreenMeta = { title: 'Updates', icon: 'refresh-cw', order: 2, fill: true, when: isSignedIn, keywords: ['update', 'new version', 'outdated'] };

const UpdatesPage = () => <StoreInstalledView mode="updates" />;

export default UpdatesPage;
export { meta };
