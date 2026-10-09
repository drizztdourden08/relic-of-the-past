/* @layer renderer-components @kind constants */
import { SANCTUARY_SITE_HOST } from '@app/lib/sanctuary/sanctuary-site';
import type { HubAccountCopy } from '@domains/app/compounds/HubAccountCard';

const SANCTUARY_COPY: HubAccountCopy = {
  signedOutLead: 'Sign in so bug reports carry your name and appear on the hub.',
  signInLabel: 'Sign in to the Sanctuary',
  openSiteLabel: 'Open Sanctuary',
  siteHost: SANCTUARY_SITE_HOST,
};

export { SANCTUARY_COPY };
