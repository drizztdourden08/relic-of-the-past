/* @layer renderer-components @kind component */
/**
 * The page for the section the nav selected. Everything but Installed needs the store, so
 * signed out those show the sign-in card; Installed reads the local record and can
 * uninstall without an account.
 */
import { useCallback } from 'react';
import type { StoreSection } from '../Store.type';
import type { StoreModel } from '../behavior/useStore';
import { StoreBrowse } from './StoreBrowse';
import { StoreHome } from './StoreHome';
import { StoreInstalledList } from './StoreInstalledList';
import { StoreSignIn } from './StoreSignIn';

const GRID_TITLES: Partial<Record<StoreSection, string>> = {
  browse: 'Browse',
  music: 'Music packs',
  character: 'Characters',
  language: 'Languages',
};

interface StoreSectionContentProps {
  store: StoreModel;
}

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
