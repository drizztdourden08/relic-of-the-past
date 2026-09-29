/* @layer renderer-components @kind component */
/**
 * Signed out: the Hookshop needs the shared account, so the whole tab says so. The store's
 * highlight and name, what signing in is for (or, when a link from the site is waiting, that
 * its install starts right after), one large Sign in button that opens the confirm page in
 * the browser, and a way to the site. While the browser confirms, the code and Cancel.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import logInIcon from '@iconify-icons/lucide/log-in';
import { Box, Button, Stack, Text } from '@ds/primitives';
import type { StoreOpenInstall } from '@shared/ipc';
import { STORE_SITE_HOST } from '@app/lib/store/store-site';
import { HookshopHighlight } from '../../../compounds/HookshopHighlight';
import { HubAccountCard } from '../../../compounds/HubAccountCard';
import type { HubAccountCopy } from '../../../compounds/HubAccountCard';
import type { StoreAccount } from '../behavior/useStoreAccount';

const STORE_COPY: HubAccountCopy = {
  signedOutLead: '',
  signInLabel: 'Sign in',
  openSiteLabel: 'Open on the site',
  siteHost: STORE_SITE_HOST,
};

const LEAD = 'Browsing and installing packs needs a Relic of the Past account. It is the same account as the Sanctuary; publishing, ratings and your profile are on the site.';
const WAITING_LINK = 'Sign in to install the pack you picked on the site. The install starts as soon as you are signed in.';
const HIGHLIGHT_PIXEL = 3;

interface StoreSignInProps {
  account: StoreAccount;
  waitingLink: StoreOpenInstall | null;
}

const StoreSignIn = (props: StoreSignInProps) => {
  const { account, waitingLink } = props;
  const waiting = account.state === 'waiting';

  return (
    <Stack gap="lg" align="center" className="store-sign-in">
      <HookshopHighlight pixelSize={HIGHLIGHT_PIXEL} className="store-sign-in__art" />
      <Text as="h2" className="store-sign-in__title">Hookshop</Text>
      {waitingLink
        ? <Box className="store-sign-in__callout"><Text as="p">{WAITING_LINK}</Text></Box>
        : <Text as="p" className="store-sign-in__lead">{LEAD}</Text>}
      {waiting ? (
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
      ) : (
        <Stack gap="sm" align="center" className="store-sign-in__actions">
          <Button variant="primary" size="md" fullWidth icon={<IconifyIcon icon={logInIcon} />} onClick={account.onSignIn}>
            Sign in with your browser
          </Button>
          <Text as="p" className="store-sign-in__hint">Your browser opens {STORE_SITE_HOST} to confirm this computer.</Text>
          {account.lastError && <Text as="p" className="store__error">{account.lastError}</Text>}
          <Button variant="ghost" size="sm" onClick={account.onOpenSite}>Open the Hookshop site</Button>
        </Stack>
      )}
    </Stack>
  );
};

export { StoreSignIn };
