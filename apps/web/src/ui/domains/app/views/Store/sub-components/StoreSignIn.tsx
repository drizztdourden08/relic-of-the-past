/* @layer renderer-components @kind component */
/**
 * Signed out: the shared account card with the Hookshop's words. Signing in opens the code
 * page on the store's site. A link that waits for the sign-in says so.
 */
import { Stack, Text } from '@ds/primitives';
import type { StoreOpenInstall } from '@shared/ipc';
import { STORE_SITE_HOST } from '@app/lib/store/store-site';
import { HubAccountCard } from '../../../compounds/HubAccountCard';
import type { HubAccountCopy } from '../../../compounds/HubAccountCard';
import type { StoreAccount } from '../behavior/useStoreAccount';

const STORE_COPY: HubAccountCopy = {
  signedOutLead: 'Sign in to browse and install packs. Publishing, ratings and your profile are on the site, with the same account.',
  signInLabel: 'Sign in',
  openSiteLabel: 'Open on the site',
  siteHost: STORE_SITE_HOST,
};

interface StoreSignInProps {
  account: StoreAccount;
  waitingLink: StoreOpenInstall | null;
}

const StoreSignIn = (props: StoreSignInProps) => {
  const { account, waitingLink } = props;

  return (
    <Stack gap="md" className="store-sign-in">
      <Text as="h2" className="store__title">Hookshop</Text>
      <HubAccountCard
        state={account.state}
        me={account.me}
        userCode={account.userCode}
        lastError={account.lastError}
        copy={STORE_COPY}
        onSignIn={account.onSignIn}
        onCancel={account.onCancel}
        onSignOut={account.onSignOut}
        onOpenSite={account.onOpenSite}
      />
      {waitingLink && (
        <Text as="p" className="store__note">The pack you picked on the site installs as soon as you are signed in.</Text>
      )}
    </Stack>
  );
};

export { StoreSignIn };
