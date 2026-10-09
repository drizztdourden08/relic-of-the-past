/* @layer renderer-components @kind component */
import { EmptyState, Spinner, Stack, Text, TextInput } from '@ds/primitives';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import type { StoreBrowseProps } from '../Store.type';
import { countLine } from '../behavior/count-line';
import { StoreDetailPanel } from './StoreDetailPanel';
import { StoreGrid } from './StoreGrid';

const StoreBrowse = (props: StoreBrowseProps) => {
  const { title, store } = props;
  const { visible, query, setQuery, catalog, statusFor, selectedId, openItem } = store;

  const list = (
    <Stack gap="md" className="store-page">
      <Text as="h2" className="store__title">{title}</Text>
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
      <StoreGrid items={visible} statusFor={statusFor} selectedId={selectedId} onSelect={openItem} />
    </Stack>
  );

  return (
    <MasterDetailLayout
      className="store-browse"
      list={list}
      detail={<StoreDetailPanel store={store} />}
      detailEmpty={!selectedId}
    />
  );
};

export { StoreBrowse };
