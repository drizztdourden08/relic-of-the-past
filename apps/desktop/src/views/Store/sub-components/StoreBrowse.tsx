/* @layer renderer-components @kind component */
import { EmptyState, Spinner, Stack, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useT } from '@drizztdourden08/brock-react';
import type { StoreBrowseProps } from '../Store.type';
import { countLine } from '../behavior/count-line';
import { StoreDetailPanel } from './StoreDetailPanel';
import { StoreGrid } from './StoreGrid';

const StoreBrowse = (props: StoreBrowseProps) => {
  const { store } = props;
  const t = useT();
  const { visible, query, setQuery, catalog, statusFor, selectedId, select } = store;

  return (
    <ListDetailLayout
      listShowTitle={false}
      className="store-browse"
      listContainers={[{
        title: t('views-store:browse.title'),
        content: (
          <Stack gap="md" className="store-page">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('views-store:browse.search')}
              aria-label={t('views-store:browse.search')}
            />
            <Text as="span" className="store__hint">{countLine(t, visible.length)}</Text>
            {catalog.error && <Text as="p" className="store__error">{catalog.error}</Text>}
            {catalog.loading && catalog.items.length === 0 && <Spinner size="sm" />}
            {!catalog.loading && visible.length === 0 && <EmptyState message={t('views-store:browse.noMatch')} />}
            <StoreGrid items={visible} statusFor={statusFor} selectedId={selectedId} onSelect={select} />
          </Stack>
        ),
      }]}
      listLabel={t('views-store:browse.listLabel')}
      detail={selectedId ? <StoreDetailPanel store={store} /> : null}
      emptyDetail={<EmptyState message={t('views-store:browse.selectPack')} />}
    />
  );
};

export { StoreBrowse };
