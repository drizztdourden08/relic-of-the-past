/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { EmptyState, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { StoreInstalledListProps } from '../Store.type';
import { StoreInstalledRow } from './StoreInstalledRow';

const StoreInstalledList = (props: StoreInstalledListProps) => {
  const { rows, emptyText, store } = props;
  const t = useT();
  const { account, confirmUninstall } = store;

  return (
    <Stack gap="md" className="store-page store-installed">
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
        <Text as="p" className="store__hint">{t('views-store:installed.hint')}</Text>
      )}
    </Stack>
  );
};

export { StoreInstalledList };
