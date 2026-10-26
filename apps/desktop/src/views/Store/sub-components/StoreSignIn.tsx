/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import logInIcon from '@iconify-icons/lucide/log-in';
import { Box, Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { HookshopHighlight } from '@rotp/design/packs';
import { HubAccountCard } from '../../../compounds/HubAccountCard';
import type { StoreSignInProps } from '../Store.type';
import { HIGHLIGHT_PIXEL, SIGN_IN_LEAD, STORE_COPY, WAITING_LINK } from '../Store.constants';

const StoreSignIn = (props: StoreSignInProps) => {
  const { account, waitingLink } = props;
  const waiting = account.state === 'waiting';

  return (
    <Stack gap="lg" align="center" className="store-sign-in">
      <HookshopHighlight pixelSize={HIGHLIGHT_PIXEL} className="store-sign-in__art" />
      {waitingLink
        ? <Box className="store-sign-in__callout"><Text as="p">{WAITING_LINK}</Text></Box>
        : <Text as="p" className="store-sign-in__lead">{SIGN_IN_LEAD}</Text>}
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
          {account.lastError && <Text as="p" className="store__error">{account.lastError}</Text>}
          <Button variant="ghost" size="sm" onClick={account.onOpenSite}>Open the Hookshop site</Button>
        </Stack>
      )}
    </Stack>
  );
};

export { StoreSignIn };
