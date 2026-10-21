/* @layer renderer-components @kind component */
import { EmptyState, Spinner, Stack, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import type { StoreBrowseProps } from '../Store.type';
import { countLine } from '../behavior/count-line';
import { StoreDetailPanel } from './StoreDetailPanel';
import { StoreGrid } from './StoreGrid';

const StoreBrowse = (props: StoreBrowseProps) => {
  const { store } = props;
  const { visible, query, setQuery, catalog, statusFor, selectedId, select } = store;

  return (
    <ListDetailLayout
      className="store-browse"
      listContainers={[{
        title: 'Packs',
        content: (
          <Stack gap="md" className="store-page">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the Hookshop"
              aria-label="Search the Hookshop"
            />
            <Text as="span" className="store__hint">{countLine(visible.length)}</Text>
            {catalog.error && <Text as="p" className="store__error">{catalog.error}</Text>}
            {catalog.loading && catalog.items.length === 0 && <Spinner size="sm" />}
            {!catalog.loading && visible.length === 0 && <EmptyState message="No pack matches." />}
            <StoreGrid items={visible} statusFor={statusFor} selectedId={selectedId} onSelect={select} />
          </Stack>
        ),
      }]}
      listLabel="Hookshop"
      detail={selectedId ? <StoreDetailPanel store={store} /> : null}
      emptyDetail={<EmptyState message="Select a pack to see it here" />}
    />
  );
};

export { StoreBrowse };
