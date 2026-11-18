/* @layer renderer-components @kind constants */
import { STORE_SITE_HOST } from '@rotp/hub-client';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { HubAccountCopy } from '../../compounds/HubAccountCard';

const HIGHLIGHT_PIXEL = 3;

const storeCopyOf = (t: I18n['t']): HubAccountCopy => ({
  signedOutLead: '',
  signInLabel: t('views-store:account.signIn'),
  openSiteLabel: t('views-store:account.openSite'),
  siteHost: STORE_SITE_HOST,
});

const BROWSE_ROUTE = 'store/browse';
const UPDATES_ROUTE = 'store/updates';

export {
  BROWSE_ROUTE,
  HIGHLIGHT_PIXEL,
  storeCopyOf,
  UPDATES_ROUTE,
};
