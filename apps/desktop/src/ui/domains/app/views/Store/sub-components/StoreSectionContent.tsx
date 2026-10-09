/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { StoreSectionContentProps } from '../Store.type';
import { GRID_TITLES } from '../Store.constants';
import { StoreBrowse } from './StoreBrowse';
import { StoreHome } from './StoreHome';
import { StoreInstalledList } from './StoreInstalledList';
import { StoreSignIn } from './StoreSignIn';

const StoreSectionContent = (props: StoreSectionContentProps) => {
  const { store } = props;
  const { section, setSection, account, catalog, rows, updates, statusFor, openItem, waitingLink } = store;
  const showUpdates = useCallback(() => setSection('updates'), [setSection]);
  const gridTitle = GRID_TITLES[section];

  if (section === 'installed') {
    return <StoreInstalledList title="Installed" rows={rows} emptyText="Nothing from the Hookshop is installed yet." store={store} />;
  }
  if (!account.signedIn || !account.me) return <StoreSignIn account={account} waitingLink={waitingLink} />;
  if (section === 'updates') {
    return <StoreInstalledList title="Updates" rows={updates} emptyText="Every installed pack is up to date." store={store} />;
  }
  if (gridTitle) return <StoreBrowse title={gridTitle} store={store} />;
  return (
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
  );
};

export { StoreSectionContent };
