/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { EmptyState, Spinner, Stack } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import { locationFacts } from './behavior/location-facts';
import { DomainTiles } from './sub-components/DomainTiles';
import type { DataStorageDetailsProps } from './DataStorageDetails.type';

const DataStorageDetails = (props: DataStorageDetailsProps) => {
  const t = useT();
  const { summary, loading } = props;

  if (summary === null) return loading ? <Spinner size="sm" /> : <EmptyState size="sm" message={t('compounds:data-storage-details.storage-details-are-not-available')} />;

  return (
    <Stack gap="md">
      <FactsPanel layout="rows" align="end" label={t('compounds:data-storage-details.data-folder')} groups={locationFacts(summary.location, { location: t('compounds:data-storage-details.location'), folder: t('compounds:data-storage-details.folder') })} />
      <DomainTiles domains={summary.domains} />
    </Stack>
  );
};

export { DataStorageDetails };
