/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { CreditsPage } from '@app/views/ProfileHub/sub-components/CreditsTab';

const meta: ScreenMeta = { title: msg('compounds:credits.screen.title'), icon: 'trophy', bare: true, requiresProfile: false, size: 'info', keywords: ['thanks', 'contributors', 'authors', 'licence'] };

const CreditsCard = () => <CreditsPage />;

export default CreditsCard;
export { meta };
