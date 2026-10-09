/* @layer renderer-components @kind component */
import { EmptyState, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { StoreInstalledListProps } from '../Store.type';
import { StoreInstalledRow } from './StoreInstalledRow';

const StoreInstalledList = (props: StoreInstalledListProps) => {
  const { title, rows, emptyText, store } = props;
  const { account, confirmUninstall } = store;

  return (
    <Stack gap="md" className="store-page store-installed">
      <Text as="h2" className="store__title">{title}</Text>
      {rows.length === 0 && <EmptyState message={emptyText} />}
      {rows.map((row) => (
        <StoreInstalledRow
          key={row.pack.itemId}
          row={row}
          canUpdate={account.signedIn}
          onSignedOut={account.onSignedOut}
          onConfirmUninstall={confirmUninstall}
        />
      ))}
      {rows.length > 0 && (
        <Text as="p" className="store__hint">Uninstalling a pack a profile uses sets that profile back to the default first.</Text>
      )}
    </Stack>
  );
};

export { StoreInstalledList };
