/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { isSignedIn } from '@app/shell/show-rules';
import { StoreInstalledView } from '@app/views/Store/sub-components/StoreInstalledView';

const meta: ScreenMeta = { title: 'Installed', icon: 'hard-drive', showHeader: true, order: 1, fill: true, when: isSignedIn, keywords: ['uninstall', 'library', 'packs on this computer'] };

const InstalledPage = () => <StoreInstalledView mode="installed" />;

export default InstalledPage;
export { meta };
