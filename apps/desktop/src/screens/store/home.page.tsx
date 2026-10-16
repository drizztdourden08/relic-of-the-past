/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { StoreHomeView } from '@app/views/Store/sub-components/StoreHomeView';

const meta: ScreenMeta = { title: 'Home', icon: 'house', fill: true, keywords: ['hookshop', 'store', 'shop', 'packs', 'install', 'download', 'sign in', 'account'] };

const HomePage = () => <StoreHomeView />;

export default HomePage;
export { meta };
