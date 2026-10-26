/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { CreditsPage } from '@app/views/ProfileHub/sub-components/CreditsTab';

const meta: ScreenMeta = { title: 'Credits', icon: 'trophy', bare: true, requiresProfile: false, size: 'info', keywords: ['thanks', 'contributors', 'authors', 'licence'] };

const CreditsCard = () => <CreditsPage />;

export default CreditsCard;
export { meta };
