/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { nav } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { BROWSE_ROUTE, UPDATES_ROUTE } from '../Store.constants';
import { useLinkInstall } from '../behavior/useLinkInstall';
import { useOpenInstall } from '../behavior/useOpenInstall';
import { useStore } from '../behavior/useStore';
import { StoreHome } from './StoreHome';
import { StoreSignIn } from './StoreSignIn';

const openItem = (itemId: string) => nav.open(BROWSE_ROUTE, { item: itemId });

const StoreHomeView = () => {
  const store = useStore({ kind: null });
  const { account, catalog, updates, statusFor } = store;
  const installLink = useLinkInstall(account.onSignedOut);
  const { waitingLink } = useOpenInstall({ signedIn: account.signedIn, onOpen: openItem, install: installLink });
  const showUpdates = useCallback(() => nav.open(UPDATES_ROUTE), []);

  return (
    <Box className="store-home">
      {account.signedIn && account.me ? (
        <StoreHome
          name={account.me.user.displayName}
          home={catalog.home}
          loading={catalog.loading}
          error={catalog.error}
          updateCount={updates.length}
          statusFor={statusFor}
          onSelect={openItem}
          onShowUpdates={showUpdates}
        />
      ) : <StoreSignIn account={account} waitingLink={waitingLink} />}
    </Box>
  );
};

export { StoreHomeView };
