/* @layer renderer-components @kind component */
/**
 * Browse and the three kind pages: a search field over the card grid, and the selected item's
 * detail beside it, in the master-detail layout the Data Manager uses with its columns
 * swapped, so the grid gets the width.
 */
import { EmptyState, Spinner, Stack, Text, TextInput } from '@ds/primitives';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import type { StoreModel } from '../behavior/useStore';
import { StoreDetailPanel } from './StoreDetailPanel';
import { StoreGrid } from './StoreGrid';

interface StoreBrowseProps {
  title: string;
  store: StoreModel;
}

const countLine = (shown: number): string => (shown === 1 ? '1 pack' : `${shown} packs`);

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
