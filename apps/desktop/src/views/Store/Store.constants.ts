/* @layer renderer-components @kind constants */
import { STORE_SITE_HOST } from '@rotp/hub-client';
import type { HubAccountCopy } from '../../compounds/HubAccountCard';

const HIGHLIGHT_PIXEL = 3;

const STORE_COPY: HubAccountCopy = {
  signedOutLead: '',
  signInLabel: 'Sign in',
  openSiteLabel: 'Open on the site',
  siteHost: STORE_SITE_HOST,
};

const SIGN_IN_LEAD = 'Browsing and installing packs needs a Relic of the Past account. It is the same account as the Sanctuary; publishing, ratings and your profile are on the site.';
const WAITING_LINK = 'Sign in to install the pack you picked on the site. The install starts as soon as you are signed in.';

const BROWSE_ROUTE = 'store/browse';
const UPDATES_ROUTE = 'store/updates';

const INSTALLED_EMPTY = {
  installed: 'Nothing from the Hookshop is installed yet.',
  updates: 'Every installed pack is up to date.',
} as const;

export {
  BROWSE_ROUTE,
  HIGHLIGHT_PIXEL,
  INSTALLED_EMPTY,
  SIGN_IN_LEAD,
  STORE_COPY,
  UPDATES_ROUTE,
  WAITING_LINK,
};
