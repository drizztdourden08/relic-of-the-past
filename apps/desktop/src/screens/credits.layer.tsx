/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { FreeWindow } from '@app/shell/free-window';
import { CreditsPage } from '@app/views/ProfileHub/sub-components/CreditsTab';

const meta: ScreenMeta = { title: 'Credits', icon: 'trophy', requiresProfile: false, size: 'info', keywords: ['thanks', 'contributors', 'authors', 'licence'] };

const CreditsLayer = (props: CardProps) => (
  <FreeWindow title={meta.title ?? 'Credits'} size="info" scroll onClose={props.close}><CreditsPage /></FreeWindow>
);

export default CreditsLayer;
export { meta };
