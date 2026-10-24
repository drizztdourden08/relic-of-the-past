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

const SIGN_IN_LEAD = 'Sign in to browse and install packs.';
const WAITING_LINK = 'Sign in to install the pack you picked.';

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
