/* @layer renderer-components @kind component */
/** Installed and Updates: the packs this computer has from the Hookshop, one row each. */
import { useCallback } from 'react';
import { EmptyState, Stack, Text } from '@ds/primitives';
import type { InstalledRow } from '../Store.type';
import type { StoreModel } from '../behavior/useStore';
import { StoreInstalledRow } from './StoreInstalledRow';

interface StoreInstalledListProps {
  title: string;
  rows: InstalledRow[];
  emptyText: string;
  store: StoreModel;
}

const StoreInstalledList = (props: StoreInstalledListProps) => {
  const { title, rows, emptyText, store } = props;
  const { installer, remover, account } = store;
  const handleUpdate = useCallback((itemId: string) => { void installer.install(itemId); }, [installer]);

  return (
    <Stack gap="md" className="store-page store-installed">
      <Text as="h2" className="store__title">{title}</Text>
      {rows.length === 0 && <EmptyState message={emptyText} />}
      {rows.map((row) => (
        <StoreInstalledRow
          key={row.pack.itemId}
          row={row}
          job={installer.jobOf(row.pack.itemId)}
          canUpdate={account.signedIn}
          uninstalling={remover.uninstallingId === row.pack.itemId}
          onUpdate={handleUpdate}
          onCancel={installer.cancel}
          onUninstall={remover.uninstall}
        />
      ))}
      {remover.uninstallError && <Text as="p" className="store__error">{remover.uninstallError}</Text>}
      {rows.length > 0 && (
        <Text as="p" className="store__hint">Uninstalling a pack a profile uses sets that profile back to the default first.</Text>
      )}
    </Stack>
  );
};

export { StoreInstalledList };
