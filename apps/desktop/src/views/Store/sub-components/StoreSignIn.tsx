/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import logInIcon from '@iconify-icons/lucide/log-in';
import { Box, Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { HookshopHighlight } from '@rotp/design/packs';
import { HubAccountCard } from '../../../compounds/HubAccountCard';
import type { StoreSignInProps } from '../Store.type';
import { HIGHLIGHT_PIXEL, storeCopyOf } from '../Store.constants';

const StoreSignIn = (props: StoreSignInProps) => {
  const { account, waitingLink } = props;
  const t = useT();
  const waiting = account.state === 'waiting';

  return (
    <Stack gap="lg" align="center" className="store-sign-in">
      <HookshopHighlight pixelSize={HIGHLIGHT_PIXEL} className="store-sign-in__art" />
      {waitingLink
        ? <Box className="store-sign-in__callout"><Text as="p">{t('views-store:signIn.waitingLink')}</Text></Box>
        : <Text as="p" className="store-sign-in__lead">{t('views-store:signIn.lead')}</Text>}
      {waiting ? (
        <HubAccountCard
          state={account.state}
          me={account.me}
          userCode={account.userCode}
          lastError={account.lastError}
          copy={storeCopyOf(t)}
          onSignIn={account.onSignIn}
          onCancel={account.onCancel}
          onSignOut={account.onSignOut}
          onOpenSite={account.onOpenSite}
        />
      ) : (
        <Stack gap="sm" align="center" className="store-sign-in__actions">
          <Button variant="primary" size="md" fullWidth icon={<IconifyIcon icon={logInIcon} />} onClick={account.onSignIn}>
            {t('views-store:signIn.browser')}
          </Button>
          {account.lastError && <Text as="p" className="store__error">{account.lastError}</Text>}
          <Button variant="ghost" size="sm" onClick={account.onOpenSite}>{t('views-store:signIn.openSite')}</Button>
        </Stack>
      )}
    </Stack>
  );
};

export { StoreSignIn };
